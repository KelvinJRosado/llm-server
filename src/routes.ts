import { Express, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory mock store for chat histories.
 * Key: chatId (string), Value: array of message objects
 */
const chatStore: Record<string, { timestamp: string; message: string }[]> = {};

/**
 * Registers all API routes on the provided Express application instance.
 * @param app Express application instance
 */
export function registerRoutes(app: Express): void {
  /**
   * Root endpoint
   * @route GET /
   * @returns {object} API information
   */
  app.get('/', (req: Request, res: Response): void => {
    console.log(
      'Received request for API information',
      JSON.stringify(req.headers)
    );

    res.status(200).json({
      name: 'LLM Server API',
      version: '1.0.0',
      description: 'A simple API server',
    });
  });

  /**
   * Basic health check endpoint
   * @route GET /hello
   * @returns {object} Simple greeting message
   */
  app.get('/hello', (req: Request, res: Response): void => {
    console.log('Received request for hello', JSON.stringify(req.headers));

    res.status(200).json({
      message: 'Hello from LLM Server!',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  });

  /**
   * Create a new chat
   * @route PUT /chats
   * @returns {object} Chat ID
   */
  app.put('/chats', (req: Request, res: Response): void => {
    const chatId = uuidv4();
    chatStore[chatId] = [];

    console.log(`Created new chat with ID: ${chatId}`);

    res.status(201).json({ chatId });
  });

  /**
   * Get chat history by chat ID
   * @route GET /chats/:chatId
   * @param chatId Chat ID
   * @returns {object} Chat history
   */
  app.get('/chats/:chatId', (req: Request, res: Response): void => {
    const { chatId } = req.params;
    const history = chatStore[chatId];
    if (!history) {
      console.error(`Chat not found for ID: ${chatId}`);
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    console.log(`Retrieved history for chat ID: ${chatId}`, history);
    res.json({ chatId, history });
  });

  /**
   * Add a message to a chat
   * @route POST /chats/:chatId
   * @param chatId Chat ID
   * @body { message: string }
   * @returns {object} Updated chat history
   */
  app.post('/chats/:chatId', (req: Request, res: Response): void => {
    const { chatId } = req.params;
    const { message } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      console.error(`Invalid message for chat ID: ${chatId}`, message);
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    if (!chatStore[chatId]) {
      console.error(`Chat not found for ID: ${chatId}`);
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    const entry = { timestamp: new Date().toISOString(), message };
    chatStore[chatId].push(entry);

    console.log(`Added message to chat ID: ${chatId}`, entry);

    res.status(201).json({ chatId, history: chatStore[chatId] });
  });
}
