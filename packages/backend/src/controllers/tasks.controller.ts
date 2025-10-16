import { Request, Response } from 'express';
import {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../config/database.js';
import { TaskRequest } from '../types.js';

export function listTasks(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const tasks = getTasksByUserId(userId);
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export function createNewTask(req: Request<{}, {}, TaskRequest>, res: Response) {
  try {
    const userId = req.userId!;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = createTask(title, description, userId);
    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export function updateTaskHandler(
  req: Request<{ id: string }, {}, TaskRequest>,
  res: Response
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const existing = getTaskById(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = updateTask(taskId, userId, req.body);
    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

export function deleteTaskHandler(req: Request<{ id: string }>, res: Response) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const existing = getTaskById(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const success = deleteTask(taskId, userId);
    if (success) {
      res.json({ message: 'Task deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}
