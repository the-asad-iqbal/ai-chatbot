import { createMistral } from '@ai-sdk/mistral';
import { createAnthropic } from '@ai-sdk/anthropic';


import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: anthropic(apiIdentifier, {
      cacheControl: true,
    }),
    middleware: customMiddleware,
  });
};

export const mistralModels = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: mistral(apiIdentifier),
    middleware: customMiddleware,
  });
};