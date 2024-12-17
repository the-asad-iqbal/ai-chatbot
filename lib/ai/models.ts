// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT 4o mini',
    apiIdentifier: 'gpt-4o-mini-2024-07-18',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gpt-4o',
    label: 'GPT 4o',
    apiIdentifier: 'gpt-4o-2024-11-20',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-4o-mini';
