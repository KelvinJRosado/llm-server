
import { InferenceClient } from '@huggingface/inference';
import { LLMConfig } from './llmConfig.js';

const client = new InferenceClient(process.env.HF_TOKEN);

/**
 * Sends a chat completion request to Hugging Face and returns only the concise answer,
 * omitting any <think> sections from the response. The default model is "deepseek-ai/DeepSeek-R1-0528".
 *
 * @param chatMessage - The user's message
 * @param chatHistory - Previous chat history
 * @param config - Configuration options for the LLM
 * @returns Promise<string> - The LLM response
 */
export const getHuggingFaceResponse = async (
  chatMessage: string,
  chatHistory: { role: string; content: string }[],
  config: LLMConfig = {}
): Promise<string> => {
  try {
    const { model = 'deepseek-ai/DeepSeek-R1-0528', temperature } = config;

    const chatCompletion = await client.chatCompletion({
      model,
      messages: [...chatHistory, { role: 'user', content: chatMessage }],
      options: {
        temperature,
      },
    });

    const originalContent =
      chatCompletion.choices[0].message.content || 'Response was not returned';

    // Remove <think>...</think> section if present
    const content = originalContent
      .replace(/<think>[\s\S]*?<\/think>/, '')
      .trim();

    return content;
  } catch (error) {
    console.error('Error during Hugging Face chat:', error);
    throw error;
  }
};
