export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  provider: 'Anthropic' | 'OpenAI' | 'Google';
  isBeta?: boolean;
}

export const models: Array<Model> = [
  // {
  //   id: 'Claude 3.5 Sonnet',
  //   label: 'Claude 3.5 Sonnet',
  //   apiIdentifier: 'claude-3-5-sonnet-20241022',
  //   provider: 'Anthropic',
  //   isBeta: false
  // },
  // {
  //   id: 'Claude 3.5 Haiku',
  //   label: 'Claude 3.5 Haiku',
  //   apiIdentifier: 'claude-3-5-haiku-20241022',
  //   provider: 'Anthropic',
  //   isBeta: false
  // },
  // {
  //   id: 'gpt-4o-2024-11-20',
  //   label: '4o',
  //   apiIdentifier: 'gpt-4o-2024-11-20',
  //   provider: 'OpenAI',
  //   isBeta: false
  // },
  // {
  //   id: 'gpt-4o-mini-2024-07-18',
  //   label: '4o Mini',
  //   apiIdentifier: 'gpt-4o-mini-2024-07-18',
  //   provider: 'OpenAI',
  //   isBeta: false
  // },
  {
    id: 'gemini-2.0-flash-exp',
    label: 'Gemini 2.0 Flash',
    apiIdentifier: 'gemini-2.0-flash-exp',
    provider: 'Google',
    isBeta: true
  },
  {
    id: 'gemini-exp-1206',
    label: 'Gemini exp-1206',
    apiIdentifier: 'gemini-exp-1206',
    provider: 'Google',
    isBeta: true
  },
  {
    id: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    apiIdentifier: 'gemini-1.5-pro',
    provider: 'Google',
    isBeta: false
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-2.0-flash-exp';
