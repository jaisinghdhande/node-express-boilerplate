const express = require('express');
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *               - assignedTo
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *               priority:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post(
  '/',
  auth,
  [
    body('title').trim().isLength({ min: 3, max: 100 }),
    body('description').trim().notEmpty(),
    body('dueDate').isISO8601(),
    body('assignedTo').isMongoId(),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    validate
  ],
  taskController.createTask
);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Get tasks with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 */
router.get('/', auth, taskController.getTasks);

/**
 * @swagger
 * /api/tasks/analytics:
 *   get:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Get task analytics and statistics
 */
router.get('/analytics', auth, taskController.getTaskAnalytics);

/**
 * @swagger
 * /api/tasks/{taskId}/status:
 *   patch:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Update task status
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 */
router.patch(
  '/:taskId/status',
  auth,
  [
    body('status').isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
    body('comment').optional().trim().notEmpty(),
    validate
  ],
  taskController.updateTaskStatus
);

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   post:
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     summary: Add a subtask
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 */
router.post(
  '/:taskId/subtasks',
  auth,
  [
    body('title').trim().notEmpty(),
    validate
  ],
  taskController.addSubtask
);

module.exports = router;