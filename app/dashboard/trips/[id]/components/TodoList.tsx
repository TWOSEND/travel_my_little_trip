"use client";

import { useState } from "react";
import type { Todo } from "@/app/api/trips/[id]/todos/route";

interface Props {
  tripId: string;
  initialTodos: Todo[];
}

export function TodoList({ tripId, initialTodos }: Props) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/trips/${tripId}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    });
    const json = await res.json();

    if (json.success) {
      setTodos((prev) => [...prev, json.data]);
      setInput("");
    }
    setLoading(false);
  }

  async function handleToggle(todo: Todo) {
    const res = await fetch(`/api/trips/${tripId}/todos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id, done: !todo.done }),
    });
    const json = await res.json();
    if (json.success) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? json.data : t)));
    }
  }

  async function handleDelete(todoId: string) {
    const res = await fetch(`/api/trips/${tripId}/todos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todoId }),
    });
    const json = await res.json();
    if (json.success) {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일 추가..."
          className="flex-1 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)] py-6 text-center">
          할 일이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] group"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo)}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.done
                    ? "line-through text-[var(--color-muted-foreground)]"
                    : "text-[var(--color-foreground)]"
                }`}
              >
                {todo.content}
              </span>
              <button
                onClick={() => handleDelete(todo.id)}
                className="text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <p className="text-xs text-[var(--color-muted-foreground)] mt-3">
          {todos.filter((t) => t.done).length}/{todos.length} 완료
        </p>
      )}
    </div>
  );
}
