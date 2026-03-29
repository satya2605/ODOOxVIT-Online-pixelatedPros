import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes mapped to /api
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
