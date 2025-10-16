import { Request, Response } from 'express';
import {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../config/database.js';
import { TaskRequest } from '../types.js';

export async function listTasks(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const tasks = await getTasksByUserId(userId);
    res.json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

export async function createNewTask(req: Request<{}, {}, TaskRequest>, res: Response) {
  try {
    const userId = req.userId!;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await createTask(title, description, userId);
    res.status(201).json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

export async function updateTaskHandler(
  req: Request<{ id: string }, {}, TaskRequest>,
  res: Response
) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const existing = await getTaskById(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await updateTask(taskId, userId, req.body);
    res.json({ task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

export async function deleteTaskHandler(req: Request<{ id: string }>, res: Response) {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id, 10);

    const existing = await getTaskById(taskId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const success = await deleteTask(taskId, userId);
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
