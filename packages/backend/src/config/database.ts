import { Pool, PoolClient } from 'pg';
import { User, Task } from '../types.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://taskapp:taskapp_password@localhost:5432/taskapp',
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Database initialized');
  } finally {
    client.release();
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createUser(email: string, password: string, name: string): Promise<User | undefined> {
  const result = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
    [email, password, name]
  );
  return result.rows[0];
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getTaskById(id: number, userId: number): Promise<Task | undefined> {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

export async function createTask(title: string, description: string | undefined, userId: number): Promise<Task | undefined> {
  const result = await pool.query(
    'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
    [title, description || null, userId]
  );
  return result.rows[0];
}

export async function updateTask(
  id: number,
  userId: number,
  updates: { title?: string; description?: string; completed?: boolean }
): Promise<Task | undefined> {
  const fields = [];
  const values: (string | boolean | number)[] = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }
  if (updates.completed !== undefined) {
    fields.push(`completed = $${paramCount++}`);
    values.push(updates.completed);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id, userId);

  const result = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteTask(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function closeDatabase() {
  await pool.end();
}
