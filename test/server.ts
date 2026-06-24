import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Database } from 'bun:sqlite';
import { resolve } from 'path';

/**
 * Creates a test server instance with its own in-memory database.
 * This mirrors the production server but uses port 3001 and an
 * isolated database for each test run.
 */
export function createTestServer() {
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

  const clientDir = resolve(import.meta.dir, '../src/client');

  const apiRoutes = new Elysia({ prefix: '/api' })
    .get('/tasks', () => {
      return db
        .query(
          `SELECT t.*, p.name as priority_name, p.color as priority_color, p.level as priority_level,
                  c.name as category_name, c.color as category_color
           FROM tasks t
           JOIN priorities p ON t.priority_id = p.id
           JOIN categories c ON t.category_id = c.id
           ORDER BY t.created_at DESC`,
        )
        .all();
    })
    .get(
      '/tasks/:id',
      ({ params }) => {
        const task = db
          .query(
            `SELECT t.*, p.name as priority_name, p.color as priority_color, p.level as priority_level,
                    c.name as category_name, c.color as category_color
             FROM tasks t
             JOIN priorities p ON t.priority_id = p.id
             JOIN categories c ON t.category_id = c.id
             WHERE t.id = ?`,
          )
          .get(params.id);
        if (!task) return new Response('Not found', { status: 404 });
        return task;
      },
      { params: t.Object({ id: t.String() }) },
    )
    .post(
      '/tasks',
      ({ body }) => {
        const result = db
          .query(
            `INSERT INTO tasks (title, description, status, priority_id, category_id, due_date)
             VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
          )
          .get(
            body.title,
            body.description || '',
            body.status || 'todo',
            body.priority_id,
            body.category_id,
            body.due_date || null,
          );
        return result;
      },
      {
        body: t.Object({
          title: t.String(),
          description: t.Optional(t.String()),
          status: t.Optional(t.String()),
          priority_id: t.Number(),
          category_id: t.Number(),
          due_date: t.Optional(t.Nullable(t.String())),
        }),
      },
    )
    .put(
      '/tasks/:id',
      ({ params, body }) => {
        const fields: string[] = [];
        const values: (string | number | null)[] = [];

        if (body.title !== undefined) {
          fields.push('title = ?');
          values.push(body.title);
        }
        if (body.description !== undefined) {
          fields.push('description = ?');
          values.push(body.description);
        }
        if (body.status !== undefined) {
          fields.push('status = ?');
          values.push(body.status);
        }
        if (body.priority_id !== undefined) {
          fields.push('priority_id = ?');
          values.push(body.priority_id);
        }
        if (body.category_id !== undefined) {
          fields.push('category_id = ?');
          values.push(body.category_id);
        }
        if (body.due_date !== undefined) {
          fields.push('due_date = ?');
          values.push(body.due_date);
        }

        fields.push("updated_at = datetime('now')");
        values.push(params.id);

        const result = db
          .query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? RETURNING *`,
          )
          .get(...values);

        if (!result) return new Response('Not found', { status: 404 });
        return result;
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          status: t.Optional(t.String()),
          priority_id: t.Optional(t.Number()),
          category_id: t.Optional(t.Number()),
          due_date: t.Optional(t.Nullable(t.String())),
        }),
      },
    )
    .delete(
      '/tasks/:id',
      ({ params }) => {
        db.query('DELETE FROM comments WHERE task_id = ?').run(params.id);
        const changes = db
          .query('DELETE FROM tasks WHERE id = ?')
          .run(params.id);
        if (changes.changes === 0)
          return new Response('Not found', { status: 404 });
        return { success: true };
      },
      { params: t.Object({ id: t.String() }) },
    )
    .patch(
      '/tasks/:id/status',
      ({ params, body }) => {
        const result = db
          .query(
            "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING *",
          )
          .get(body.status, params.id);
        if (!result) return new Response('Not found', { status: 404 });
        return result;
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({ status: t.String() }),
      },
    )
    .get(
      '/tasks/:id/comments',
      ({ params }) => {
        return db
          .query(
            'SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC',
          )
          .all(params.id);
      },
      { params: t.Object({ id: t.String() }) },
    )
    .post(
      '/tasks/:id/comments',
      ({ params, body }) => {
        const result = db
          .query(
            'INSERT INTO comments (task_id, content, author) VALUES (?, ?, ?) RETURNING *',
          )
          .get(params.id, body.content, body.author || 'Usuário');
        return result;
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          content: t.String(),
          author: t.Optional(t.String()),
        }),
      },
    )
    .get('/categories', () => {
      return db.query('SELECT * FROM categories ORDER BY name').all();
    })
    .get('/priorities', () => {
      return db.query('SELECT * FROM priorities ORDER BY level').all();
    });

  const app = new Elysia()
    .use(cors())
    .use(apiRoutes)
    .onError(({ error }) => {
      // Suppress unhandled errors (like ENOENT for missing files)
      return new Response('Internal Server Error', { status: 500 });
    })
    .get('/', () => Bun.file(`${clientDir}/index.html`))
    .get('/assets/:file', ({ params }) => {
      return Bun.file(`${clientDir}/dist/assets/${params.file}`);
    })
    .listen({ port: 3001, hostname: '127.0.0.1' });

  return { app, db };
}
