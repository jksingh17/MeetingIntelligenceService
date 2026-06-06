import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth';
import meetingRoutes from './routes/meetings';
import actionItemRoutes from './routes/actionItems';
import healthRoutes from './routes/health';
import { traceIdMiddleware } from './middlewares/traceId';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: 'Too many requests from this IP, please try again later.',
});

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Meeting Intelligence Service API',
    version: '0.1.0',
    description: 'Backend API for meeting analysis, action items, and reminders.',
  },
  servers: [
  { url: 'https://meetingintelligenceservice.onrender.com', description: 'Production' },
  { url: 'http://localhost:4000', description: 'Local Development' },
],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(traceIdMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/', healthRoutes);
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Meeting Intelligence Service API',
    version: '0.1.0',
    docs: 'https://meetingintelligenceservice.onrender.com/api-docs',
    health: 'https://meetingintelligenceservice.onrender.com/health',
  });
});
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ success: false, traceId: req.traceId ?? 'unknown', error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

export default app;
