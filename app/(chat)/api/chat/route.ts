import {
  type Message,
  createDataStreamResponse,
  convertToCoreMessages,
  streamText,
} from 'ai';
import { z } from 'zod';
import Together from "together-ai";
import { v2 as cloudinary } from 'cloudinary';

import { auth } from '@/app/(auth)/auth';
import { createModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import systemPrompt from '@/lib/ai/prompts';
import {
  addMemory,
  deleteChatById,
  deleteMessageById,
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

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


type AllowedTools =
  | 'getWeather'
  | 'generateImage'
  | 'updateMemory'

const weatherTools: AllowedTools[] = ['getWeather'];

const generateImageTools: AllowedTools[] = ['generateImage'];

const updateMemoryTools: AllowedTools[] = ['updateMemory'];

const allTools: AllowedTools[] = [
  ...weatherTools,
  ...generateImageTools,
  ...updateMemoryTools,
];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

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
  let savedUserMessage = false;

  const userProfile = await userMemories({
    id: session.user.id,
  })
  const cleanedProfile = userProfile.map((memory) => memory.text).join('-');

  return createDataStreamResponse({
    execute: dataStream => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        model: createModel(model.apiIdentifier),
        system: systemPrompt + `**User Profile**:\n ${cleanedProfile}`,
        messages: coreMessages,
        maxSteps: 5,
        temperature: 1,
        experimental_activeTools: allTools,
        tools: {
          getWeather: {
            description:
              'Get the current weather at a location. The user can give you a city name, so don\'t ask them about the longitude and latitude. Just add it by yourself, or if you really really don\'t, then say give me the longitude and latitude.',
            parameters: z.object({
              latitude: z.number(),
              longitude: z.number(),
            }),
            execute: async ({ latitude, longitude }) => {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
              );

              const weatherData = await response.json();
              return weatherData;
            },
          },
          generateImage: {
            description: 'Generates an image based on a provided prompt',
            parameters: z.object({
              prompt: z
                .string()
                .describe('Description or instruction for generating the image'),
            }),
            execute: async ({ prompt }) => {
              try {
                const response = await together.images.create({
                  model: "black-forest-labs/FLUX.1-schnell-Free",
                  prompt: prompt,
                  width: 1440,
                  height: 1024,
                  steps: 4,
                  n: 1,
                  response_format: "base64",
                });

                const base64Image = response.data[0]?.b64_json;

                if (!base64Image) {
                  throw new Error("Image generation failed.");
                }

                const uploadResponse = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
                  folder: 'uploads',
                  public_id: generateUUID(),
                  resource_type: 'image',
                });

                return {
                  url: uploadResponse.secure_url,
                  prompt,
                  message: "Image generated and displayed successfully. Now say, I have generated.....",
                };
              } catch (error) {
                console.error('Error generating or uploading image:', error);
                return { error: 'Failed to generate or upload image.' };
              }
            }
          },
          updateMemory: {
            description: 'Memorizes something for later user for that user. Like personalizations etc...',
            parameters: z.object({
              text: z
                .string()
                .describe('The text to be memorized. Max 300 characters.'),
            }),
            execute: async ({ text }) => {
              const res = await addMemory({ text, userId: session.user?.id ?? '' });
              if (res) {
                return {
                  message: 'Text has been memorized successfully. Move one!',
                };
              }
              return {
                error: 'Failed to memorize text. Skip it, and move on!',
              };
            }
          }
        },
        onFinish: async ({ response }) => {
          if (session.user?.id) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);

              await saveMessages({
                messages: [
                  { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
                ],
              });
              savedUserMessage = true;

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    const messageId = generateUUID();

                    if (message.role === 'assistant') {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  },
                ),
              });
            } catch (error) {
              if (savedUserMessage) {
                try {
                  await deleteMessageById({ id: userMessageId });
                } catch (deleteError) {
                  console.error('Failed to delete user message after error:', deleteError);
                }
              }
              console.error('Failed to save chat');
              throw error; // Let the error be handled by onError
            }
          }

          dataStream.writeData({
            type: 'finish',
            content: '',
          });
        },
      });

      result.mergeIntoDataStream(dataStream);
    },

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
      status: 500
    });
  }
}
