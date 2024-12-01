const Task = require('../models/task');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

// Cache key prefix for tasks
const CACHE_KEY_PREFIX = 'task:';

exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      createdBy: req.userId
    });
    await task.save();
    
    // Invalidate cache
    await redisClient.del(`${CACHE_KEY_PREFIX}all`);
    
    res.status(201).json(task);
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      dueDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Try to get from cache first
    const cacheKey = `${CACHE_KEY_PREFIX}all`;
    const cachedTasks = await redisClient.get(cacheKey);
    
    if (cachedTasks) {
      return res.json(JSON.parse(cachedTasks));
    }

    // Build query
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (dueDate) {
      query.dueDate = {
        $gte: new Date(dueDate),
        $lt: new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() + 1))
      };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    const result = {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 300 // Cache for 5 minutes
    });

    res.json(result);
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

exports.getTaskAnalytics = async (req, res) => {
  try {
    const analytics = await Task.aggregate([
      {
        $facet: {
          'statusBreakdown': [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          'priorityDistribution': [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          'userWorkload': [
            {
              $group: {
                _id: '$assignedTo',
                taskCount: { $sum: 1 },
                highPriorityTasks: {
                  $sum: { $cond: [{ $gte: ['$priority', 4] }, 1, 0] }
                }
              }
            },
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }},
            { $unwind: '$userInfo' }
          ],
          'overdueTasks': [
            {
              $match: {
                dueDate: { $lt: new Date() },
                status: { $ne: 'DONE' }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json(analytics[0]);
  } catch (error) {
    logger.error('Task analytics error:', error);
    res.status(500).json({ message: 'Error generating analytics' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (comment) {
      task.comments.push({
        user: req.userId,
        content: comment
      });
    }

    await task.save();
    await redisClient.del(`${CACHE_KEY_PREFIX}all`);

    res.json(task);
  } catch (error) {
    logger.error('Update task status error:', error);
    res.status(500).json({ message: 'Error updating task status' });
  }
};

exports.addSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $push: { subtasks: { title } } },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await redisClient.del(`${CACHE_KEY_PREFIX}all`);
    res.json(task);
  } catch (error) {
    logger.error('Add subtask error:', error);
    res.status(500).json({ message: 'Error adding subtask' });
  }
};