import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Task } from '../types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/app.db');

export const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database initialized');
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: number) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function createUser(email: string, password: string, name: string) {
  const stmt = db.prepare(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
  );
  const result = stmt.run(email, password, name);
  return getUserById(Number(result.lastInsertRowid));
}

export function getTasksByUserId(userId: number) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Task[];
}

export function getTaskById(id: number, userId: number) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
  return stmt.get(id, userId) as Task | undefined;
}

export function createTask(title: string, description: string | undefined, userId: number) {
  const stmt = db.prepare(
    'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)'
  );
  const result = stmt.run(title, description || null, userId);
  return getTaskById(Number(result.lastInsertRowid), userId);
}

export function updateTask(
  id: number,
  userId: number,
  updates: { title?: string; description?: string; completed?: boolean }
) {
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, userId);

  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`);
  stmt.run(...values);

  return getTaskById(id, userId);
}

export function deleteTask(id: number, userId: number) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
  const result = stmt.run(id, userId);
  return result.changes > 0;
}
