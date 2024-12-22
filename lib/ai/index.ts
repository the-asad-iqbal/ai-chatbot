import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';
import { customMiddleware } from './custom-middleware';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const getModelProvider = (model: string) => {
  if (model.startsWith('claude')) return anthropic;
  if (model.startsWith('gpt')) return openai;
  if (model.startsWith('gemini')) return google;
  throw new Error(`Unsupported model: ${model}`);
};

export const createModel = (apiIdentifier: string) => {
  const provider = getModelProvider(apiIdentifier);
  const options = provider === anthropic ? { cacheControl: true } : {};

  return wrapLanguageModel({
    model: provider(apiIdentifier, options),
    middleware: customMiddleware,
  });
};
