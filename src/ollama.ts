import { Ollama } from 'ollama';
import { LLMConfig } from './llmConfig.js';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

/**
 * Get response from Ollama with configuration options
 * @param chatMessage - The user's message
 * @param chatHistory - Previous chat history
 * @param config - Configuration options for the LLM
 * @returns Promise<string> - The LLM response
 */
export const getOllamaResponse = async (
  chatMessage: string,
  chatHistory: { role: string; content: string }[],
  config: LLMConfig = {}
): Promise<string> => {
  try {
    const { model = 'llama3.2', temperature = 0.7 } = config;

    const response = await ollama.chat({
      model,
      messages: [...chatHistory, { role: 'user', content: chatMessage }],
      options: {
        temperature,
      },
    });
    return response.message.content;
  } catch (error) {
    console.error('Error during Ollama chat:', error);
    throw error;
  }
};
