import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const getOllamaResponse = async (
  chatMessage: string,
  chatHistory: { role: string; content: string }[]
) => {
  try {
    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [...chatHistory, { role: 'user', content: chatMessage }],
    });
    return response.message.content;
  } catch (error) {
    console.error('Error during Ollama chat:', error);
    throw error;
  }
};
