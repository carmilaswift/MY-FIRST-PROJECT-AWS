// # my code joao lucas
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const API = '/api';

async function fetchJSON(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority_id: number;
  category_id: number;
  due_date: string | null;
  priority_name: string;
  priority_color: string;
  priority_level: number;
  category_name: string;
  category_color: string;
}

interface Comment {
  id: number;
  task_id: number;
  content: string;
  author: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}
interface Priority {
  id: number;
  name: string;
  level: number;
  color: string;
}

const COLUMNS = [
  {
    id: 'todo',
    title: 'A Fazer',
    icon: 'ph-circle-dashed',
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/5',
    border: 'border-accent-orange/20',
    dot: 'bg-accent-orange',
  },
  {
    id: 'in-progress',
    title: 'Em Progresso',
    icon: 'ph-spinner',
    color: 'text-accent-blue',
    bg: 'bg-accent-blue/5',
    border: 'border-accent-blue/20',
    dot: 'bg-accent-blue',
  },
  {
    id: 'done',
    title: 'Concluída',
    icon: 'ph-check-circle',
    color: 'text-accent-green',
    bg: 'bg-accent-green/5',
    border: 'border-accent-green/20',
    dot: 'bg-accent-green',
  },
];

const PRIORITY_ICONS: Record<number, string> = {
  1: 'ph-arrow-down',
  2: 'ph-equals',
  3: 'ph-arrow-up',
  4: 'ph-fire',
};

// ─── Confirm Dialog ─────────────────────────────
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-surface-700 border border-surface-500 rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-accent-red/10 rounded-xl flex items-center justify-center">
            <i className="ph ph-warning text-accent-red text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-surface-600 hover:bg-surface-500 text-gray-300 text-sm font-medium transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-accent-red/90 hover:bg-accent-red text-white text-sm font-medium transition"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal (Create/Edit) ───────────────────
function TaskModal({
  open,
  task,
  categories,
  priorities,
  onSave,
  onClose,
}: {
  open: boolean;
  task: Task | null;
  categories: Category[];
  priorities: Priority[];
  onSave: (form: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority_id: 2,
    category_id: 1,
    due_date: '',
    status: 'todo',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority_id: task.priority_id,
        category_id: task.category_id,
        due_date: task.due_date || '',
        status: task.status,
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority_id: 2,
        category_id: 1,
        due_date: '',
        status: 'todo',
      });
    }
  }, [task, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, due_date: form.due_date || null });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-surface-700 border border-surface-500 rounded-2xl p-6 w-full max-w-lg animate-scale-in shadow-card-hover max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-100">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition p-1 rounded-lg hover:bg-surface-600"
            aria-label="Fechar"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Título *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-500 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition"
              placeholder="Nome da tarefa"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-500 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition resize-none"
              placeholder="Detalhes da tarefa..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Prioridade
              </label>
              <select
                value={form.priority_id}
                onChange={(e) =>
                  setForm({ ...form, priority_id: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-500 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-accent-blue/50"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Categoria
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-500 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-accent-blue/50"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-500 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-600 hover:bg-surface-500 text-gray-300 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl btn-primary text-white text-sm font-medium"
            >
              {task ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Task Detail Modal ──────────────────────────
function TaskDetailModal({
  open,
  task,
  onClose,
  onDelete,
  onStatusChange,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && task) {
      fetchJSON(`${API}/tasks/${task.id}/comments`)
        .then(setComments)
        .catch(() => {});
    }
  }, [open, task]);

  if (!open || !task) return null;

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await fetchJSON(`${API}/tasks/${task.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      const updated = await fetchJSON(`${API}/tasks/${task.id}/comments`);
      setComments(updated);
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '—';
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();
  const isDueToday =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-surface-700 border border-surface-500 rounded-2xl p-6 w-full max-w-2xl animate-scale-in shadow-card-hover max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-100 mb-2">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                style={{
                  backgroundColor: task.priority_color + '15',
                  color: task.priority_color,
                }}
              >
                <i
                  className={`ph ${PRIORITY_ICONS[task.priority_level] || 'ph-equals'} text-xs`}
                ></i>
                {task.priority_name}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{
                  backgroundColor: task.category_color + '15',
                  color: task.category_color,
                }}
              >
                {task.category_name}
              </span>
              {isOverdue && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-accent-red/10 text-accent-red font-medium">
                  Atrasada
                </span>
              )}
              {isDueToday && !isOverdue && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-accent-orange/10 text-accent-orange font-medium">
                  Vence Hoje
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition ml-4 p-1 rounded-lg hover:bg-surface-600"
            aria-label="Fechar"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>

        <div className="bg-surface-800 rounded-xl p-4 mb-4 border border-surface-600">
          <p className="text-sm text-gray-400 leading-relaxed">
            {task.description || 'Sem descrição.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-surface-800 rounded-xl p-3 border border-surface-600">
            <span className="text-gray-500 text-xs block mb-1">Vencimento</span>
            <span
              className={
                isOverdue
                  ? 'text-accent-red font-medium'
                  : isDueToday
                    ? 'text-accent-orange font-medium'
                    : 'text-gray-300'
              }
            >
              {formatDate(task.due_date)}
            </span>
          </div>
          <div className="bg-surface-800 rounded-xl p-3 border border-surface-600">
            <span className="text-gray-500 text-xs block mb-1">Status</span>
            <span className="text-gray-300">
              {COLUMNS.find((c) => c.id === task.status)?.title}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {task.status !== 'done' && (
            <button
              onClick={() => {
                onStatusChange(task.id, 'done');
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-green/10 text-accent-green hover:bg-accent-green/20 text-sm font-medium transition"
            >
              <i className="ph ph-check-circle"></i> Marcar Concluída
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-red/10 text-accent-red hover:bg-accent-red/20 text-sm font-medium transition"
          >
            <i className="ph ph-trash"></i> Excluir
          </button>
        </div>

        {/* Comments */}
        <div className="border-t border-surface-600 pt-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <i className="ph ph-chat-text text-accent-blue"></i>
            Comentários ({comments.length})
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
              placeholder="Adicionar comentário..."
              className="flex-1 px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition"
            />
            <button
              onClick={addComment}
              disabled={loading}
              className="px-4 py-2.5 btn-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhum comentário ainda.
              </p>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-surface-800 rounded-xl p-3 border border-surface-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-accent-blue">
                    {c.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ──────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onClick,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onClick: (t: Task) => void;
}) {
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : null;
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();
  const isDueToday =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date).toDateString() === new Date().toDateString();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).classList.add('dragging');
  };
  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('dragging');
  };

  const nextStatus: Record<string, string> = {
    todo: 'in-progress',
    'in-progress': 'done',
    done: 'todo',
  };

  return (
    <article
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="task-card bg-surface-700 rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-card border border-surface-600 group"
      style={{ borderLeft: `3px solid ${task.priority_color}` }}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide flex items-center gap-1"
            style={{
              backgroundColor: task.priority_color + '15',
              color: task.priority_color,
            }}
          >
            <i
              className={`ph ${PRIORITY_ICONS[task.priority_level] || 'ph-equals'} text-[10px]`}
            ></i>
            {task.priority_name}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
            style={{
              backgroundColor: task.category_color + '15',
              color: task.category_color,
            }}
          >
            {task.category_name}
          </span>
        </div>
      </div>
      <h4 className="font-semibold text-sm mb-1 text-gray-100">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {task.due_date && (
            <span
              className={`flex items-center gap-1 ${isOverdue ? 'text-accent-red' : isDueToday ? 'text-accent-orange' : ''}`}
            >
              <i className="ph ph-calendar-blank"></i>
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, nextStatus[task.status]);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-600 text-gray-500 hover:text-accent-green transition"
            title="Alterar status"
            aria-label="Alterar status"
          >
            <i className="ph ph-arrow-right text-sm"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-600 text-gray-500 hover:text-accent-blue transition"
            title="Editar"
            aria-label="Editar tarefa"
          >
            <i className="ph ph-pencil-simple text-sm"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-600 text-gray-500 hover:text-accent-red transition"
            title="Excluir"
            aria-label="Excluir tarefa"
          >
            <i className="ph ph-trash text-sm"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Kanban Column ──────────────────────────────
function KanbanColumn({
  column,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onCardClick,
}: {
  column: (typeof COLUMNS)[0];
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onCardClick: (t: Task) => void;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onStatusChange(Number(taskId), column.id);
  };

  return (
    <section
      className={`kanban-col drop-zone rounded-2xl border border-surface-600 bg-surface-800/50 p-4 transition-all`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${column.dot}`}></div>
          <h3 className="font-semibold text-sm text-gray-200">
            {column.title}
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-surface-600 text-gray-400">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-10 text-gray-600 text-sm">
            <i className="ph ph-plus-circle text-2xl block mb-2 opacity-40"></i>
            Arraste tarefas aqui
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onClick={onCardClick}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Sidebar ────────────────────────────────────
function Sidebar({
  tasks,
  onNewTask,
}: {
  tasks: Task[];
  onNewTask: () => void;
}) {
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter(
    (t) => t.status === 'in-progress',
  ).length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const overdueCount = tasks.filter(
    (t) =>
      t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date(),
  ).length;

  return (
    <aside className="w-[260px] bg-surface-800 border-r border-surface-600 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-surface-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue">
            <i className="ph ph-kanban text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-100">Kanban</h1>
            <p className="text-[11px] text-gray-500">Gestão de Tarefas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="sidebar-item active flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
          <i className="ph ph-squares-four text-accent-blue text-lg"></i>
          <span className="text-sm font-medium text-gray-200">Quadro</span>
        </div>
        <div className="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
          <i className="ph ph-list-checks text-gray-500 text-lg"></i>
          <span className="text-sm font-medium text-gray-400">
            Todas as Tarefas
          </span>
          <span className="ml-auto text-[11px] bg-surface-600 text-gray-400 px-1.5 py-0.5 rounded-md font-medium">
            {tasks.length}
          </span>
        </div>

        {overdueCount > 0 && (
          <div className="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer">
            <i className="ph ph-clock-countdown text-accent-red text-lg"></i>
            <span className="text-sm font-medium text-gray-400">Atrasadas</span>
            <span className="ml-auto text-[11px] bg-accent-red/15 text-accent-red px-1.5 py-0.5 rounded-md font-medium">
              {overdueCount}
            </span>
          </div>
        )}

        <div className="pt-4 pb-2 px-3">
          <span className="text-[11px] uppercase tracking-wider text-gray-600 font-semibold">
            Status
          </span>
        </div>
        <div className="sidebar-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-accent-orange"></div>
          <span className="text-sm text-gray-400">A Fazer</span>
          <span className="ml-auto text-[11px] text-gray-500">{todoCount}</span>
        </div>
        <div className="sidebar-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
          <span className="text-sm text-gray-400">Em Progresso</span>
          <span className="ml-auto text-[11px] text-gray-500">
            {inProgressCount}
          </span>
        </div>
        <div className="sidebar-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-accent-green"></div>
          <span className="text-sm text-gray-400">Concluídas</span>
          <span className="ml-auto text-[11px] text-gray-500">{doneCount}</span>
        </div>
      </nav>

      {/* New Task Button */}
      <div className="p-4 border-t border-surface-600">
        <button
          onClick={onNewTask}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 btn-primary rounded-xl text-sm font-medium text-white"
        >
          <i className="ph ph-plus text-base"></i>
          Nova Tarefa
        </button>
      </div>
    </aside>
  );
}

// ─── Main App ───────────────────────────────────
function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const loadTasks = () => fetchJSON(`${API}/tasks`).then(setTasks);
  const loadMeta = () => {
    fetchJSON(`${API}/categories`).then(setCategories);
    fetchJSON(`${API}/priorities`).then(setPriorities);
  };

  useEffect(() => {
    loadTasks();
    loadMeta();
  }, []);

  const handleSave = async (form: any) => {
    if (editingTask) {
      await fetchJSON(`${API}/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
    } else {
      await fetchJSON(`${API}/tasks`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetchJSON(`${API}/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const handleDeleteConfirm = async () => {
    if (confirmDelete) {
      await fetchJSON(`${API}/tasks/${confirmDelete}`, { method: 'DELETE' });
      setConfirmDelete(null);
      setDetailTask(null);
      loadTasks();
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };
  const openNew = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const tasksByCol: Record<string, Task[]> = {
    todo: todoTasks,
    'in-progress': inProgressTasks,
    done: doneTasks,
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar tasks={tasks} onNewTask={openNew} />

      {/* Main Content */}
      <div className="flex-1 ml-[260px]">
        {/* Top Bar */}
        <header className="bg-surface-800/80 backdrop-blur-md border-b border-surface-600 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-100">Quadro Kanban</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Gerencie suas tarefas com drag &amp; drop
              </p>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 btn-primary rounded-xl text-sm font-medium text-white"
            >
              <i className="ph ph-plus-circle text-base"></i>
              Nova Tarefa
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Status counters */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card bg-surface-800 border border-surface-600 rounded-2xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-11 h-11 bg-accent-orange/10 rounded-xl flex items-center justify-center">
                <i className="ph ph-circle-dashed text-accent-orange text-xl"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-100">
                  {todoTasks.length}
                </p>
                <p className="text-xs text-gray-500">A Fazer</p>
              </div>
            </div>
            <div className="stat-card bg-surface-800 border border-surface-600 rounded-2xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-11 h-11 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <i className="ph ph-spinner text-accent-blue text-xl"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-100">
                  {inProgressTasks.length}
                </p>
                <p className="text-xs text-gray-500">Em Progresso</p>
              </div>
            </div>
            <div className="stat-card bg-surface-800 border border-surface-600 rounded-2xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-11 h-11 bg-accent-green/10 rounded-xl flex items-center justify-center">
                <i className="ph ph-check-circle text-accent-green text-xl"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-100">
                  {doneTasks.length}
                </p>
                <p className="text-xs text-gray-500">Concluídas</p>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByCol[col.id]}
                onEdit={openEdit}
                onDelete={(id) => setConfirmDelete(id)}
                onStatusChange={handleStatusChange}
                onCardClick={(t) => setDetailTask(t)}
              />
            ))}
          </main>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        categories={categories}
        priorities={priorities}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
      />
      <TaskDetailModal
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onDelete={(id) => {
          setDetailTask(null);
          setConfirmDelete(id);
        }}
        onStatusChange={(id, s) => {
          handleStatusChange(id, s);
          setDetailTask(null);
        }}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ─── Mount ──────────────────────────────────────
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
