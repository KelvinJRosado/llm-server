import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes.js';
import {
  getSteamUserGames,
  getSteamUserId,
  getSteamUserInfo,
} from './steam.js';
import { _ } from 'ollama/dist/shared/ollama.d792a03f.js';

/**
 * Express application instance
 */
const app = express();

/**
 * Server port configuration
 */
const PORT = 5000;

// Configure CORS options
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly list allowed methods
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ], // Explicitly list allowed headers
  credentials: true, // Allow cookies to be sent with cross-origin requests
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use the cors middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
// app.options('*', cors(corsOptions));

/**
 * Middleware to parse JSON requests
 */
app.use(express.json());

/**
 * Register API routes
 */
registerRoutes(app);

await getSteamUserId();

/**
 * Start the Express server
 */
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
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
