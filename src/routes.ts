import { Express, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getOllamaResponse } from './ollama';
import { LLMConfig } from './llmConfig';

/**
 * Interface for gaming service integrations
 */
export interface GameIntegration {
  service: 'steam' | 'epic' | 'playstation' | 'xbox';
  username: string;
  connectedAt: string;
}

/**
 * Object containing valid models for each provider.
 * Extend these arrays to allow additional models per provider.
 */
export const validModels: Record<string, string[]> = {
  ollama: ['llama3.2'],
  huggingFace: ['deepseek-ai/DeepSeek-R1-0528'],
};

/**
 * In-memory mock store for chat histories.
 * Key: chatId (string), Value: array of message objects
 */
const chatStore: Record<
  string,
  { timestamp: string; content: string; role: string }[]
> = {};

/**
 * In-memory store for user integrations.
 * Key: userId (string), Value: array of gaming service integrations
 */
const integrationStore: Record<string, GameIntegration[]> = {};

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
    console.log('Received request for hello');

    res.status(200).json({
      message: 'Hello from LLM Server!',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
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
   * Add a message to a chat
   * @route POST /chats/:chatId
   * @param chatId Chat ID
   * @body { content: string, config?: LLMConfig }
   * @returns {object} Updated chat history
   */
  app.post(
    '/chats/:chatId',
    async (req: Request, res: Response): Promise<void> => {
      const { chatId } = req.params;
      const { content, config } = req.body;

      console.log(`Incoming request for chat ${chatId}`, { content, config });

      if (typeof content !== 'string' || !content.trim()) {
        console.error(`Invalid content for chat ID: ${chatId}`, content);
        res.status(400).json({ error: 'Content is required' });
        return;
      }
      if (!chatStore[chatId]) {
        console.error(`Chat not found for ID: ${chatId}`);
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      const requestEntry = {
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        content,
        id: uuidv4(),
        role: 'user',
      };

      // Sanitize config: ensure all numeric options are correct type
      const numericFloatKeys = ['temperature'];
      let safeConfig = config;
      if (config && typeof config === 'object') {
        safeConfig = { ...config };
        for (const key of numericFloatKeys) {
          if (key in safeConfig) {
            const val = parseFloat(safeConfig[key]);
            if (isNaN(val)) {
              delete safeConfig[key];
            } else {
              safeConfig[key] = val;
            }
          }
        }
      }

      // Validate model input and determine provider
      let provider: string | undefined;
      if (
        safeConfig &&
        typeof safeConfig === 'object' &&
        'model' in safeConfig
      ) {
        // Find which provider the model belongs to
        for (const [prov, models] of Object.entries(validModels)) {
          if (models.includes(safeConfig.model)) {
            provider = prov;
            break;
          }
        }
        if (!provider) {
          const allAllowedModels = Object.values(validModels).flat();
          console.error(
            `Invalid model '${
              safeConfig.model
            }'. Allowed models: ${allAllowedModels.join(', ')}`
          );
          res.status(400).json({
            error: `Invalid model. Allowed models: ${allAllowedModels.join(
              ', '
            )}`,
          });
          return;
        }
      }

      // Call the appropriate function based on provider
      let responseContent: string | undefined;
      if (provider === 'ollama') {
        responseContent = await getOllamaResponse(
          content,
          chatStore[chatId],
          safeConfig as LLMConfig
        );
      } else if (provider === 'huggingFace') {
        // Dynamically import to avoid circular dependency if not used
        const { getHuggingFaceResponse } = await import('./huggingFace');
        responseContent = await getHuggingFaceResponse(
          content,
          chatStore[chatId],
          safeConfig as LLMConfig
        );
      } else {
        // Fallback: should not happen due to earlier validation
        res.status(500).json({ error: 'No valid provider found for model.' });
        return;
      }

      const responseEntry = {
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        content: responseContent,
        id: uuidv4(),
        role: 'assistant',
      };

      // TODO: Update this to use a DB
      chatStore[chatId].push(requestEntry);
      chatStore[chatId].push(responseEntry);

      // Exclude id from response to client
      const stripId = ({ id, ...rest }: any) => rest;
      const interaction = {
        response: stripId(responseEntry),
      };
      console.log(`Interaction recorded for chat ID: ${chatId}`, interaction);

      res.status(201).json(interaction);
    }
  );

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
    // Exclude id from all messages in history
    const stripId = ({ id, ...rest }: any) => rest;
    const safeHistory = history.map(stripId);
    console.log(`Retrieved history for chat ID: ${chatId}`, safeHistory);
    res.json({ chatId, history: safeHistory });
  });

  /**
   * Add or update a gaming service integration
   * @route POST /integration
   * @body { userId: string, service: string, username: string }
   * @returns {object} Success message with integration data
   */
  app.post('/integration', (req: Request, res: Response): void => {
    const { userId, service, username } = req.body;

    console.log(`Received integration request:`, { userId, service, username });

    // Validate required fields
    if (!userId || !service || !username) {
      console.error('Missing required fields for integration');
      res.status(400).json({
        error:
          'Missing required fields: userId, service, and username are required',
      });
      return;
    }

    // Validate service type
    const validServices = ['steam', 'epic', 'playstation', 'xbox'];
    if (!validServices.includes(service)) {
      console.error(`Invalid service type: ${service}`);
      res.status(400).json({
        error: `Invalid service. Must be one of: ${validServices.join(', ')}`,
      });
      return;
    }

    // Initialize user integrations if not exists
    if (!integrationStore[userId]) {
      integrationStore[userId] = [];
    }

    // Check if integration already exists for this service
    const existingIntegrationIndex = integrationStore[userId].findIndex(
      (integration) => integration.service === service
    );

    const newIntegration: GameIntegration = {
      service: service as GameIntegration['service'],
      username: username.trim(),
      connectedAt: new Date().toISOString(),
    };

    if (existingIntegrationIndex >= 0) {
      // Update existing integration
      integrationStore[userId][existingIntegrationIndex] = newIntegration;
      console.log(`Updated integration for user ${userId}, service ${service}`);
    } else {
      // Add new integration
      integrationStore[userId].push(newIntegration);
      console.log(
        `Added new integration for user ${userId}, service ${service}`
      );
    }

    res.status(201).json({
      message: 'Integration saved successfully',
      integration: newIntegration,
    });
  });

  /**
   * Get all integrations for a user
   * @route GET /integration/:userId
   * @param userId User ID
   * @returns {object} User integrations
   */
  app.get('/integration/:userId', (req: Request, res: Response): void => {
    const { userId } = req.params;
    const integrations = integrationStore[userId] || [];

    console.log(`Retrieved integrations for user ${userId}:`, integrations);

    res.json({
      userId,
      integrations,
    });
  });
}
