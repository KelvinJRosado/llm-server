import { InferenceClient } from '@huggingface/inference';

const client = new InferenceClient(process.env.HF_TOKEN);

/**
 * Sends a chat completion request to Hugging Face and returns only the concise answer,
 * omitting any <think> sections from the response. The default model is "deepseek-ai/DeepSeek-R1-0528".
 *
 * @param messages - The array of chat messages to send.
 * @param model - (Optional) The model to use. Defaults to "deepseek-ai/DeepSeek-R1-0528".
 * @returns The concise assistant response as a string.
 */
export const getHuggingFaceResponse = async (
  messages: Array<{ role: string; content: string }>,
  model = 'deepseek-ai/DeepSeek-R1-0528'
): Promise<string> => {
  try {
    const chatCompletion = await client.chatCompletion({
      model,
      messages,
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
