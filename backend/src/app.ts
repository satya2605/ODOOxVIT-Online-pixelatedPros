import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Explicitly allow the Next.js frontend to communicate with the backend
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.56.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Allow large base64 receipt images

// Main API routes mapped to /api
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
