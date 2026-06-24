# 📋 Kanban Board

Aplicação web de gerenciamento de tarefas com suporte a drag-and-drop. Organize tarefas em colunas de status (A Fazer / Em Progresso / Concluída), atribua prioridades, categorias, datas de vencimento e adicione comentários.

## ✨ Funcionalidades

- Criar, editar, mover e excluir tarefas
- Três colunas de status: A Fazer, Em Progresso, Concluída
- Drag-and-drop entre colunas
- Níveis de prioridade (Baixa, Média, Alta, Urgente)
- Categorias com cores personalizadas
- Datas de vencimento com indicação visual de urgência
- Comentários com autor em cada tarefa
- Dados seed para demonstração rápida

## 🛠️ Tech Stack

| Camada     | Tecnologia                         |
| ---------- | ---------------------------------- |
| Runtime    | [Bun](https://bun.sh)              |
| Backend    | Elysia + bun:sqlite (WAL mode)     |
| Frontend   | React 18 (SPA) + Tailwind CSS 3    |
| Ícones     | Phosphor Icons (CDN)               |
| Validação  | @sinclair/typebox (via Elysia `t`) |
| Formatação | Prettier                           |

## 🚀 Getting Started

### Pré-requisitos

- [Bun](https://bun.sh) ≥ 1.0

```bash
# Instalar Bun (macOS / Linux)
curl -fsSL https://bun.sh/install | bash
```

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd kanban-bun

# Instalar dependências
bun install
```

### Executando

```bash
# Build do frontend
bun run build.ts

# Iniciar o servidor de desenvolvimento
bun run dev
```

O servidor estará disponível em **http://localhost:3000**.

> O banco de dados SQLite (`kanban.db`) é criado automaticamente na raiz do projeto com dados de exemplo na primeira execução.

## 📁 Estrutura do Projeto

```
.
├── src/
│   ├── client/               # Frontend (React SPA)
│   │   ├── App.tsx           # App React completo (single-file)
│   │   ├── index.html        # HTML shell servido em /
│   │   └── dist/assets/      # Build output (app.js)
│   └── server/               # Backend (Elysia)
│       ├── index.ts          # Entry point, static file serving
│       ├── routes.ts         # Rotas da API (/api/*)
│       └── db.ts             # Setup SQLite, schema e seed data
├── build.ts                  # Script de build (Bun bundler)
├── kanban.db                 # Banco SQLite (auto-criado)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .prettierrc
```

## 📡 API Reference

Todos os endpoints estão sob o prefixo `/api`.

| Método | Rota                      | Descrição              |
| ------ | ------------------------- | ---------------------- |
| GET    | `/api/tasks`              | Lista todas as tarefas |
| GET    | `/api/tasks/:id`          | Detalhes de uma tarefa |
| POST   | `/api/tasks`              | Cria uma nova tarefa   |
| PUT    | `/api/tasks/:id`          | Atualiza tarefa        |
| DELETE | `/api/tasks/:id`          | Remove tarefa          |
| PATCH  | `/api/tasks/:id/status`   | Altera status          |
| GET    | `/api/tasks/:id/comments` | Lista comentários      |
| POST   | `/api/tasks/:id/comments` | Adiciona comentário    |
| GET    | `/api/categories`         | Lista categorias       |
| GET    | `/api/priorities`         | Lista prioridades      |

## 🗄️ Banco de Dados

- **SQLite** embutido via `bun:sqlite` — sem dependência externa
- Arquivo `kanban.db` criado automaticamente na raiz do projeto
- WAL mode habilitado para melhor performance
- Schema e dados seed aplicados no startup (`src/server/db.ts`)

### Tabelas

- `tasks` — tarefas com título, descrição, status, prioridade, categoria e data
- `priorities` — níveis de prioridade (Baixa, Média, Alta, Urgente)
- `categories` — categorias com nome e cor
- `comments` — comentários vinculados a tarefas

## 📜 Scripts Disponíveis

| Comando                | Descrição                      |
| ---------------------- | ------------------------------ |
| `bun run dev`          | Inicia o servidor (porta 3000) |
| `bun run build.ts`     | Build do frontend              |
| `bun run format`       | Formata código com Prettier    |
| `bun run format:check` | Verifica formatação            |

## 🏗️ Decisões de Arquitetura

- **Monorepo single-package** — client e server no mesmo projeto
- **Server serve o client** — Elysia entrega HTML e assets diretamente, sem hosting separado
- **SQLite local** — zero configuração de banco, ideal para dev e apps single-node
- **SPA single-file** — todos os componentes em `App.tsx` para simplicidade

## 📄 Licença

A definir.
# MY-FIRST-PROJECT-AWS
