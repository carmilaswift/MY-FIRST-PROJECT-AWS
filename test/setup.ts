import { Database } from 'bun:sqlite';

/**
 * Creates a fresh in-memory SQLite database with the same schema as production.
 * Used by tests to avoid touching the real kanban.db file.
 */
export function createTestDb(): Database {
  const db = new Database(':memory:');

  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6366f1'
    );

    CREATE TABLE IF NOT EXISTS priorities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      level INTEGER NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in-progress', 'done')),
      priority_id INTEGER NOT NULL DEFAULT 2,
      category_id INTEGER NOT NULL DEFAULT 1,
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (priority_id) REFERENCES priorities(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Usuário',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Seed priorities
  const insertPriority = db.prepare(
    'INSERT INTO priorities (name, level, color) VALUES (?, ?, ?)',
  );
  insertPriority.run('Baixa', 1, '#22c55e');
  insertPriority.run('Média', 2, '#f59e0b');
  insertPriority.run('Alta', 3, '#ef4444');
  insertPriority.run('Urgente', 4, '#dc2626');

  // Seed categories
  const insertCategory = db.prepare(
    'INSERT INTO categories (name, color) VALUES (?, ?)',
  );
  insertCategory.run('Desenvolvimento', '#6366f1');
  insertCategory.run('Design', '#ec4899');
  insertCategory.run('Marketing', '#14b8a6');
  insertCategory.run('Infraestrutura', '#f97316');
  insertCategory.run('Documentação', '#8b5cf6');

  return db;
}

/**
 * Base URL for the test server.
 */
export const BASE_URL = 'http://localhost:3001';

/**
 * Helper to make API requests.
 */
export async function api(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}
