import { useOptimistic, useState, useTransition } from 'react'
import { getErrorMessage, updateTodoStatus } from './api'
import { CreateTodoForm } from './components/CreateTodoForm'
import { TodoFilters } from './components/TodoFilters'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { EMPTY_FILTERS, matchesFilters } from './types'
import type { Todo, TodoFilters as Filters, TodoStatus } from './types'
import './App.css'

interface StatusUpdate {
  id: string
  status: TodoStatus
}

export default function App() {
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS })
  const { todos, loading, error, reload, upsert } = useTodos(filters)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [visibleTodos, applyOptimistic] = useOptimistic(
    todos,
    (current, update: StatusUpdate) =>
      current
        .map((todo) =>
          todo.id === update.id ? { ...todo, status: update.status } : todo,
        )
        .filter((todo) => matchesFilters(todo, filters)),
  )

  function handleChangeStatus(todo: Todo, status: TodoStatus) {
    setActionError(null)

    startTransition(async () => {
      applyOptimistic({ id: todo.id, status })

      try {
        const updated = await updateTodoStatus(todo.id, status)
        upsert(updated)
      } catch (cause) {
        setActionError(getErrorMessage(cause))
      }
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Todo management</p>
          <h1>Keep the team in sync</h1>
          <p className="subtitle">
            Create todos, assign owners, and move work through the flow.
          </p>
        </div>
      </header>

      {actionError && (
        <div className="feedback error banner" role="alert">
          <span>{actionError}</span>
          <button
            className="button ghost small"
            type="button"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="layout">
        <TodoFilters
          filters={filters}
          onApply={setFilters}
          onClear={() => setFilters({ ...EMPTY_FILTERS })}
        />

        <div className="content">
          <TodoList
            todos={visibleTodos}
            loading={loading}
            error={error}
            isPending={isPending}
            onChangeStatus={handleChangeStatus}
            onRetry={reload}
          />

          <aside className="sidebar">
            <CreateTodoForm onCreated={upsert} />
          </aside>
        </div>
      </main>
    </div>
  )
}
