import { Elysia, t } from 'elysia';
import db from './db';
import { logger } from './logger';
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from './errors';

// ─── Helpers ─────────────────────────────────────────────────

const VALID_STATUSES = ['todo', 'in-progress', 'done'] as const;

function validateStatus(status: string): void {
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    throw new ValidationError(
      `Status inválido: "${status}". Use: ${VALID_STATUSES.join(', ')}`,
      { status: `Deve ser um de: ${VALID_STATUSES.join(', ')}` },
    );
  }
}

function validateTaskTitle(title: string): void {
  if (!title.trim()) {
    throw new ValidationError('O título da tarefa não pode estar vazio.', {
      title: 'Campo obrigatório',
    });
  }
  if (title.length > 200) {
    throw new ValidationError(
      'O título da tarefa deve ter no máximo 200 caracteres.',
      { title: 'Máximo de 200 caracteres' },
    );
  }
}

function validateCommentContent(content: string): void {
  if (!content.trim()) {
    throw new ValidationError(
      'O conteúdo do comentário não pode estar vazio.',
      { content: 'Campo obrigatório' },
    );
  }
}

function validateForeignKey(table: string, id: number, label: string): void {
  const exists = db.query(`SELECT id FROM ${table} WHERE id = ?`).get(id) as {
    id: number;
  } | null;
  if (!exists) {
    throw new ValidationError(`${label} com id ${id} não existe.`, {
      [label.toLowerCase()]: 'Referência inválida',
    });
  }
}

function buildErrorResponse(error: AppError) {
  const body: Record<string, unknown> = {
    error: error.message,
    statusCode: error.statusCode,
  };
  if (error instanceof ValidationError && Object.keys(error.fields).length) {
    body.fields = error.fields;
  }
  return body;
}

// ─── Routes ──────────────────────────────────────────────────

export const apiRoutes = new Elysia({ prefix: '/api' })

  // Global error handler for all API routes
  .onError(({ code, error, request }) => {
    const method = request.method;
    const path = new URL(request.url).pathname;

    // Elysia validation errors (from typebox schemas)
    if (code === 'VALIDATION') {
      logger.warn('Erro de validação de schema', {
        method,
        path,
        statusCode: 400,
        detail: error.message,
      });
      return new Response(
        JSON.stringify({
          error: 'Dados inválidos na requisição. Verifique os campos enviados.',
          statusCode: 400,
          detail: error.message,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Our custom AppError hierarchy
    if (error instanceof AppError) {
      const level = error.statusCode >= 500 ? 'error' : 'warn';
      logger[level](`${error.constructor.name}: ${error.message}`, {
        method,
        path,
        statusCode: error.statusCode,
      });
      return new Response(JSON.stringify(buildErrorResponse(error)), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Unexpected / internal errors
    logger.error('Erro interno inesperado', {
      method,
      path,
      statusCode: 500,
      detail: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
        statusCode: 500,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  })

  // ─── Tasks ───────────────────────────────────────────────
  .get('/tasks', ({ request }) => {
    const tasks = db
      .query(
        `
        SELECT t.*, p.name as priority_name, p.color as priority_color, p.level as priority_level,
               c.name as category_name, c.color as category_color
        FROM tasks t
        JOIN priorities p ON t.priority_id = p.id
        JOIN categories c ON t.category_id = c.id
        ORDER BY t.created_at DESC
      `,
      )
      .all();

    logger.info('Listagem de tarefas', {
      method: 'GET',
      path: '/api/tasks',
      count: tasks.length,
    });
    return tasks;
  })

  .get(
    '/tasks/:id',
    ({ params }) => {
      const task = db
        .query(
          `
        SELECT t.*, p.name as priority_name, p.color as priority_color, p.level as priority_level,
               c.name as category_name, c.color as category_color
        FROM tasks t
        JOIN priorities p ON t.priority_id = p.id
        JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `,
        )
        .get(params.id);

      if (!task) {
        throw new NotFoundError('Tarefa', params.id);
      }
      return task;
    },
    { params: t.Object({ id: t.String() }) },
  )

  .post(
    '/tasks',
    ({ body }) => {
      validateTaskTitle(body.title);

      if (body.status) {
        validateStatus(body.status);
      }

      validateForeignKey('priorities', body.priority_id, 'Prioridade');
      validateForeignKey('categories', body.category_id, 'Categoria');

      const result = db
        .query(
          `INSERT INTO tasks (title, description, status, priority_id, category_id, due_date)
         VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
        )
        .get(
          body.title.trim(),
          body.description || '',
          body.status || 'todo',
          body.priority_id,
          body.category_id,
          body.due_date || null,
        );

      logger.info('Tarefa criada', {
        method: 'POST',
        path: '/api/tasks',
        taskId: (result as { id: number })?.id,
      });
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
      // Verify task exists first
      const existing = db
        .query('SELECT id FROM tasks WHERE id = ?')
        .get(params.id);
      if (!existing) {
        throw new NotFoundError('Tarefa', params.id);
      }

      // Validate fields if provided
      if (body.title !== undefined) {
        validateTaskTitle(body.title);
      }
      if (body.status !== undefined) {
        validateStatus(body.status);
      }
      if (body.priority_id !== undefined) {
        validateForeignKey('priorities', body.priority_id, 'Prioridade');
      }
      if (body.category_id !== undefined) {
        validateForeignKey('categories', body.category_id, 'Categoria');
      }

      const fields: string[] = [];
      const values: (string | number | null)[] = [];

      if (body.title !== undefined) {
        fields.push('title = ?');
        values.push(body.title.trim());
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

      if (fields.length === 0) {
        throw new ValidationError(
          'Nenhum campo fornecido para atualização.',
          {},
        );
      }

      fields.push("updated_at = datetime('now')");
      values.push(params.id);

      const result = db
        .query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
        .get(...values);

      logger.info('Tarefa atualizada', {
        method: 'PUT',
        path: `/api/tasks/${params.id}`,
        taskId: params.id,
      });
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
      const existing = db
        .query('SELECT id FROM tasks WHERE id = ?')
        .get(params.id);
      if (!existing) {
        throw new NotFoundError('Tarefa', params.id);
      }

      db.query('DELETE FROM comments WHERE task_id = ?').run(params.id);
      db.query('DELETE FROM tasks WHERE id = ?').run(params.id);

      logger.info('Tarefa removida', {
        method: 'DELETE',
        path: `/api/tasks/${params.id}`,
        taskId: params.id,
      });
      return { success: true };
    },
    { params: t.Object({ id: t.String() }) },
  )

  .patch(
    '/tasks/:id/status',
    ({ params, body }) => {
      validateStatus(body.status);

      const result = db
        .query(
          "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING *",
        )
        .get(body.status, params.id);

      if (!result) {
        throw new NotFoundError('Tarefa', params.id);
      }

      logger.info('Status da tarefa atualizado', {
        method: 'PATCH',
        path: `/api/tasks/${params.id}/status`,
        taskId: params.id,
        newStatus: body.status,
      });
      return result;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ status: t.String() }),
    },
  )

  // ─── Comments ────────────────────────────────────────────
  .get(
    '/tasks/:id/comments',
    ({ params }) => {
      // Verify parent task exists
      const task = db.query('SELECT id FROM tasks WHERE id = ?').get(params.id);
      if (!task) {
        throw new NotFoundError('Tarefa', params.id);
      }

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
      // Verify parent task exists
      const task = db.query('SELECT id FROM tasks WHERE id = ?').get(params.id);
      if (!task) {
        throw new NotFoundError('Tarefa', params.id);
      }

      validateCommentContent(body.content);

      const result = db
        .query(
          'INSERT INTO comments (task_id, content, author) VALUES (?, ?, ?) RETURNING *',
        )
        .get(params.id, body.content.trim(), body.author || 'Usuário');

      logger.info('Comentário adicionado', {
        method: 'POST',
        path: `/api/tasks/${params.id}/comments`,
        taskId: params.id,
      });
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

  // ─── Categories & Priorities ─────────────────────────────
  .get('/categories', () => {
    return db.query('SELECT * FROM categories ORDER BY name').all();
  })

  .get('/priorities', () => {
    return db.query('SELECT * FROM priorities ORDER BY level').all();
  });
