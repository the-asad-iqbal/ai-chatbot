import {
  createDataStreamResponse,
  convertToCoreMessages,
  streamText,
} from 'ai';
import { z } from 'zod';
import Together from "together-ai";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { auth } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  addMemory,
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  userMemories,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

const TOOLS = {
  WEATHER: 'getWeather',
  IMAGE: 'generateImage',
  MEMORY: 'updateMemory'
} as const;

type AllowedTools = typeof TOOLS[keyof typeof TOOLS];

const allTools: AllowedTools[] = Object.values(TOOLS);

const toolDefinitions = {
  [TOOLS.WEATHER]: {
    description: 'Get the current weather at a location. The user can give you a city name.',
    parameters: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    execute: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
      );
      return response.json();
    },
  },
  [TOOLS.IMAGE]: {
    description: 'Generates an image based on a provided prompt',
    parameters: z.object({
      prompt: z.string().describe('Description for generating the image'),
    }),
    execute: async ({ prompt }: { prompt: string }) => {
      try {
        const together = new Together({ apiKey: process.env.TOGETHER_API_KEY! });
        const response = await together.images.create({
          model: "black-forest-labs/FLUX.1-schnell-Free",
          prompt,
          width: 1440,
          height: 1024,
          steps: 4,
          n: 1,
          response_format: "base64",
        });

        const base64Image = response.data[0]?.b64_json;
        if (!base64Image) throw new Error("Image generation failed.");

        const { secure_url } = await cloudinary.uploader.upload(
          `data:image/png;base64,${base64Image}`,
          {
            folder: 'uploads',
            public_id: generateUUID(),
            resource_type: 'image',
          }
        );

        return {
          url: secure_url,
          prompt,
          message: "Image generated and displayed successfully. Now say, I have generated.....",
        };
      } catch (error) {
        console.error('Error generating/uploading image:', error);
        return { error: 'Failed to generate or upload image.' };
      }
    }
  },
  [TOOLS.MEMORY]: {
    description: 'Memorizes something for later user for that user.',
    parameters: z.object({
      text: z.string().describe('The text to be memorized. Max 300 characters.'),
    }),
    execute: async ({ text }: { text: string }, userId: string) => {
      try {
        await addMemory({ text, userId });
        return { message: 'Text has been memorized successfully. Move one!' };
      } catch {
        return { error: 'Failed to memorize text. Skip it, and move on!' };
      }
    }
  }
};

function convertMessageContent(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(part =>
    typeof part === 'string' ? part : JSON.stringify(part)
  ).join('');
  return JSON.stringify(content);
}

export async function POST(request: Request) {
  const { id, messages, modelId } = await request.json();
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  const model = models.find(m => m.id === modelId);
  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  const userMessageId = generateUUID();
  await saveMessages({
    messages: [{
      ...userMessage,
      id: userMessageId,
      createdAt: new Date(),
      chatId: id,
      content: convertMessageContent(userMessage.content)
    }],
  });

  const userMemory = await userMemories({ id: userId });
  const userProfile = `User Profile: ${JSON.stringify(userMemory)}`;

  return createDataStreamResponse({
    execute: dataStream => {
      dataStream.writeData({ type: 'user-message-id', content: userMessageId });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt + userProfile,
        messages: coreMessages,
        maxSteps: 5,
        toolChoice: 'auto',
        temperature: 1,
        experimental_activeTools: allTools,
        tools: {
          [TOOLS.WEATHER]: toolDefinitions[TOOLS.WEATHER],
          [TOOLS.IMAGE]: toolDefinitions[TOOLS.IMAGE],
          [TOOLS.MEMORY]: {
            ...toolDefinitions[TOOLS.MEMORY],
            execute: (params) => toolDefinitions[TOOLS.MEMORY].execute(params, userId)
          }
        },
        onFinish: async ({ response }) => {
          try {
            const sanitizedMessages = sanitizeResponseMessages(response.messages);
            await saveMessages({
              messages: sanitizedMessages.map(message => ({
                id: generateUUID(),
                chatId: id,
                role: message.role,
                content: convertMessageContent(message.content),
                createdAt: new Date(),
              })),
            });
          } catch (error) {
            console.error('Failed to save chat');
          }
          dataStream.writeData({ type: 'finish', content: '' });
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => error instanceof Error ? error.message : String(error),
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
