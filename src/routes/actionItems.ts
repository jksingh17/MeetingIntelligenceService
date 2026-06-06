import { Router } from 'express';
import { createActionItemHandler, updateActionItemStatusHandler, listActionItemsHandler } from '../controllers/actionItemController';
import { authMiddleware } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { createActionItemSchema, updateActionStatusSchema, actionItemFiltersSchema } from '../validators/actionItemValidators';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/action-items:
 *   post:
 *     tags:
 *       - ActionItems
 *     summary: Create an action item manually
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               assignee:
 *                 type: string
 *               meetingId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               citations:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Action item created
 */
router.post('/', validateRequest(createActionItemSchema), createActionItemHandler);

/**
 * @openapi
 * /api/action-items/{id}/status:
 *   patch:
 *     tags:
 *       - ActionItems
 *     summary: Update action item status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Action item status updated
 */
router.patch('/:id/status', validateRequest(updateActionStatusSchema), updateActionItemStatusHandler);

/**
 * @openapi
 * /api/action-items:
 *   get:
 *     tags:
 *       - ActionItems
 *     summary: List action items with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *       - in: query
 *         name: meetingId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Action items returned
 */
router.get('/', validateRequest(actionItemFiltersSchema), listActionItemsHandler);

export default router;
