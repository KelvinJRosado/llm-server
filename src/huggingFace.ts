import { InferenceClient } from '@huggingface/inference';

const client = new InferenceClient(process.env.HF_TOKEN);

/**
 * Sends a chat completion request to Hugging Face and logs only the concise answer,
 * omitting any <think> sections from the response.
 */
export const testHuggingFace = async () => {
  try {
    const chatCompletion = await client.chatCompletion({
      model: 'deepseek-ai/DeepSeek-R1-0528',
      messages: [
        {
          role: 'user',
          content: 'What is the capital of France?',
        },
      ],
    });

    // Extract the message content
    const originalContent =
      chatCompletion.choices[0].message.content || 'Response was not returned';

    console.log(originalContent);

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
