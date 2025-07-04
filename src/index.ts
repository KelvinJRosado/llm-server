import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';
import { testHuggingFace } from './huggingFace.js';

/**
 * Express application instance
 */
const app = express();

/**
 * Server port configuration
 */
const PORT = 5000;

/**
 * Middleware to enable CORS for all origins and methods
 * Adjust the options below for production security as needed
 */
app.use(cors());

/**
 * Middleware to parse JSON requests
 */
app.use(express.json());

/**
 * Register API routes
 */
registerRoutes(app);

await testHuggingFace();

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
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
