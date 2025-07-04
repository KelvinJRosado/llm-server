/**
 * Common configuration interface for LLM requests (used by both Ollama and Hugging Face)
 */
export interface LLMConfig {
  model?: string;
  temperature?: number;
  [key: string]: unknown;
}
