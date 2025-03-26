export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  isTemplate: boolean;
  isFavorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
  author?: string;
  userId:string
}

export interface LLMConfig {
  provider: 'ollama' | 'openai' | 'custom';
  model: string;
  apiKey?: string;
  endpoint?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultLLM: LLMConfig;
  defaultTags: string[];
}

export enum PromptFilter {
  ALL = 'all',
  TEMPLATES = 'templates',
  FAVORITES = 'favorites'
}
