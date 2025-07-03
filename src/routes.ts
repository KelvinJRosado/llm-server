import { Express } from 'express';

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
  app.get('/', (req, res) => {
    console.log(
      'Received request for API information',
      JSON.stringify(req.headers)
    );

    res.json({
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
  app.get('/hello', (req, res) => {
    console.log('Received request for hello', JSON.stringify(req.headers));

    res.json({
      message: 'Hello from LLM Server!',
      timestamp: new Date().toISOString(),
      status: 'success',
    });
  });
}
