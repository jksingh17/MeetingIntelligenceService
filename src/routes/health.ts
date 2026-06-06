import { Router } from 'express';
import { healthHandler, evaluationHandler } from '../controllers/healthController';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Service is up
 */
router.get('/health', healthHandler);

/**
 * @openapi
 * /api/evaluation:
 *   get:
 *     tags:
 *       - Health
 *     summary: Return candidate and feature information
 *     responses:
 *       200:
 *         description: Evaluation information returned
 */
router.get('/api/evaluation', evaluationHandler);

export default router;
