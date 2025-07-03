import express from 'express';

/**
 * Express application instance
 */
const app = express();

/**
 * Server port configuration
 */
const PORT = 5000;

/**
 * Middleware to parse JSON requests
 */
app.use(express.json());

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
    description: 'A simple Express API server with TypeScript',
    endpoints: {
      '/': 'API information',
      '/hello': 'Simple greeting endpoint',
    },
  });
});

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET / - API information`);
  console.log(`   GET /hello - Simple greeting`);
});

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated gracefully...');
  process.exit(0);
});
