import { Router } from 'express';
import { createMeetingHandler, getMeetingHandler, listMeetingsHandler, analyzeMeetingHandler } from '../controllers/meetingController';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { createMeetingSchema, meetingFiltersSchema } from '../validators/meetingValidators';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/meetings:
 *   post:
 *     tags:
 *       - Meetings
 *     summary: Create a new meeting record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               meetingDate:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               transcript:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Meeting created
 */
router.post('/', validateRequest(createMeetingSchema), createMeetingHandler);

/**
 * @openapi
 * /api/meetings:
 *   get:
 *     tags:
 *       - Meetings
 *     summary: List meetings with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting list returned
 */
router.get('/', validateRequest(meetingFiltersSchema), listMeetingsHandler);

/**
 * @openapi
 * /api/meetings/{id}:
 *   get:
 *     tags:
 *       - Meetings
 *     summary: Get meeting details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meeting details returned
 */
router.get('/:id', getMeetingHandler);

/**
 * @openapi
 * /api/meetings/{id}/analyze:
 *   post:
 *     tags:
 *       - Meetings
 *     summary: Analyze a meeting transcript with AI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI analysis returned
 */
router.post('/:id/analyze', analyzeMeetingHandler);

export default router;
