
export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'Claude 3.5 Sonnet',
    label: 'Claude 3.5 Sonnet',
    apiIdentifier: 'claude-3-5-sonnet-20241022',
    description: 'Best for daily tasks.',
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'pixtral-12b-2409';
