import { Database } from 'bun:sqlite';

const db = new Database('kanban.db', { create: true });

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL');

// Create tables
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

// Seed priorities if empty
const priorityCount = db
  .query('SELECT COUNT(*) as count FROM priorities')
  .get() as { count: number };
if (priorityCount.count === 0) {
  const insertPriority = db.prepare(
    'INSERT INTO priorities (name, level, color) VALUES (?, ?, ?)',
  );
  insertPriority.run('Baixa', 1, '#22c55e');
  insertPriority.run('Média', 2, '#f59e0b');
  insertPriority.run('Alta', 3, '#ef4444');
  insertPriority.run('Urgente', 4, '#dc2626');
}

// Seed categories if empty
const categoryCount = db
  .query('SELECT COUNT(*) as count FROM categories')
  .get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare(
    'INSERT INTO categories (name, color) VALUES (?, ?)',
  );
  insertCategory.run('Desenvolvimento', '#6366f1');
  insertCategory.run('Design', '#ec4899');
  insertCategory.run('Marketing', '#14b8a6');
  insertCategory.run('Infraestrutura', '#f97316');
  insertCategory.run('Documentação', '#8b5cf6');
}

// Seed tasks if empty
const taskCount = db.query('SELECT COUNT(*) as count FROM tasks').get() as {
  count: number;
};
if (taskCount.count === 0) {
  const insertTask = db.prepare(
    'INSERT INTO tasks (title, description, status, priority_id, category_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
  );
  insertTask.run(
    'Implementar autenticação JWT',
    'Criar sistema de login com tokens JWT, incluindo refresh tokens e middleware de verificação.',
    'todo',
    3,
    1,
    '2026-07-10',
  );
  insertTask.run(
    'Redesign da página inicial',
    'Atualizar hero section, adicionar animações e melhorar responsividade mobile.',
    'in-progress',
    2,
    2,
    '2026-07-05',
  );
  insertTask.run(
    'Configurar CI/CD pipeline',
    'Setup GitHub Actions com testes automatizados, linting e deploy automático para staging.',
    'todo',
    3,
    4,
    '2026-07-15',
  );
  insertTask.run(
    'Escrever documentação da API',
    'Documentar todos os endpoints REST com exemplos de request/response usando OpenAPI.',
    'done',
    1,
    5,
    '2026-06-20',
  );
  insertTask.run(
    'Campanha de lançamento Q3',
    'Preparar materiais para redes sociais, email marketing e landing page do produto.',
    'in-progress',
    2,
    3,
    '2026-07-01',
  );

  // Seed some comments
  const insertComment = db.prepare(
    'INSERT INTO comments (task_id, content, author) VALUES (?, ?, ?)',
  );
  insertComment.run(
    1,
    'Precisamos definir a estratégia de refresh token antes de começar.',
    'Ana',
  );
  insertComment.run(
    1,
    'Sugiro usar httpOnly cookies para o refresh token.',
    'Carlos',
  );
  insertComment.run(
    2,
    'O protótipo no Figma já está aprovado, podemos seguir.',
    'Marina',
  );
  insertComment.run(
    4,
    'Documentação finalizada e publicada no Swagger UI.',
    'Pedro',
  );
  insertComment.run(
    5,
    'Falta definir o calendário de posts para Instagram.',
    'Julia',
  );
}

export default db;
