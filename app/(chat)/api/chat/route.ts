import {
  type Message,
  createDataStreamResponse,
  convertToCoreMessages,
  streamObject,
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
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather'
  | 'generateImage';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const generateImageTools: AllowedTools[] = ['generateImage'];

const allTools: AllowedTools[] = [
  ...blocksTools,
  ...weatherTools,
  ...generateImageTools,
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

  const { name } = session.user

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

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

  return createDataStreamResponse({
    execute: dataStream => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt + "User Name: " + name,
        messages: coreMessages,
        maxSteps: 5,
        temperature: 0.7,
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
          createDocument: {
            description: 'Create a document for a writing activity',
            parameters: z.object({
              title: z.string(),
            }),
            execute: async ({ title }) => {
              const id = generateUUID();
              let draftText = '';

              dataStream.writeData({
                type: 'id',
                content: id,
              });

              dataStream.writeData({
                type: 'title',
                content: title,
              });

              dataStream.writeData({
                type: 'clear',
                content: '',
              });

              const { fullStream } = streamText({
                model: customModel(model.apiIdentifier),
                system:
                  'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
                prompt: title,
              });

              for await (const delta of fullStream) {
                const { type } = delta;

                if (type === 'text-delta') {
                  const { textDelta } = delta;

                  draftText += textDelta;
                  dataStream.writeData({
                    type: 'text-delta',
                    content: textDelta,
                  });
                }
              }

              dataStream.writeData({ type: 'finish', content: '' });

              if (session.user?.id) {
                await saveDocument({
                  id,
                  title,
                  content: draftText,
                  userId: session.user.id,
                });
              }

              return {
                id,
                title,
                content: 'A document was created and is now visible to the user.',
              };
            },
          },
          updateDocument: {
            description: 'Update a document with the given description',
            parameters: z.object({
              id: z.string().describe('The ID of the document to update'),
              description: z
                .string()
                .describe('The description of changes that need to be made'),
            }),
            execute: async ({ id, description }) => {
              const document = await getDocumentById({ id });

              if (!document) {
                return {
                  error: 'Document not found',
                };
              }

              const { content: currentContent } = document;
              let draftText = '';

              dataStream.writeData({
                type: 'clear',
                content: document.title,
              });

              const { fullStream } = streamText({
                model: customModel(model.apiIdentifier),
                system:
                  'You are a helpful writing assistant. Based on the description, please update the piece of writing.',
                experimental_providerMetadata: {
                  openai: {
                    prediction: {
                      type: 'content',
                      content: currentContent,
                    },
                  },
                },
                messages: [
                  {
                    role: 'user',
                    content: description,
                  },
                  { role: 'user', content: currentContent },
                ],
              });

              for await (const delta of fullStream) {
                const { type } = delta;

                if (type === 'text-delta') {
                  const { textDelta } = delta;

                  draftText += textDelta;
                  dataStream.writeData({
                    type: 'text-delta',
                    content: textDelta,
                  });
                }
              }

              dataStream.writeData({ type: 'finish', content: '' });

              if (session.user?.id) {
                await saveDocument({
                  id,
                  title: document.title,
                  content: draftText,
                  userId: session.user.id,
                });
              }

              return {
                id,
                title: document.title,
                content: 'The document has been updated successfully.',
              };
            },
          },
          requestSuggestions: {
            description: 'Request suggestions for a document',
            parameters: z.object({
              documentId: z
                .string()
                .describe('The ID of the document to request edits'),
            }),
            execute: async ({ documentId }) => {
              const document = await getDocumentById({ id: documentId });

              if (!document || !document.content) {
                return {
                  error: 'Document not found',
                };
              }

              const suggestions: Array<
                Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
              > = [];

              const { elementStream } = streamObject({
                model: customModel(model.apiIdentifier),
                system:
                  'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
                prompt: document.content,
                output: 'array',
                schema: z.object({
                  originalSentence: z.string().describe('The original sentence'),
                  suggestedSentence: z.string().describe('The suggested sentence'),
                  description: z
                    .string()
                    .describe('The description of the suggestion'),
                }),
              });

              for await (const element of elementStream) {
                const suggestion = {
                  originalText: element.originalSentence,
                  suggestedText: element.suggestedSentence,
                  description: element.description,
                  id: generateUUID(),
                  documentId: documentId,
                  isResolved: false,
                };

                dataStream.writeData({
                  type: 'suggestion',
                  content: suggestion,
                });

                suggestions.push(suggestion);
              }

              if (session.user?.id) {
                const userId = session.user.id;

                await saveSuggestions({
                  suggestions: suggestions.map((suggestion) => ({
                    ...suggestion,
                    userId,
                    createdAt: new Date(),
                    documentCreatedAt: document.createdAt,
                  })),
                });
              }

              return {
                id: documentId,
                title: document.title,
                message: 'Suggestions have been added to the document',
              };
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
          memorize: {
            description: 'Memorizes something for later user for that user. Like personalizations etc...',
            parameters: z.object({
              text: z
                .string()
                .describe('The text to be memorized. Max 300 characters.'),
            }),
            execute: async ({ text }) => {
              console.log(text);

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
              console.error('Failed to save chat');
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
    onError: (error) => {
      return error instanceof Error ? error.message : String(error);
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
      status: 500,
    });
  }
}
