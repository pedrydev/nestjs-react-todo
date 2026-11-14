import { STATUS_LABELS } from '../types'
import type { Todo, TodoStatus } from '../types'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  error: string | null
  isPending: boolean
  onChangeStatus: (todo: Todo, status: TodoStatus) => void
  onRetry: () => void
}

interface TodoItemProps {
  todo: Todo
  onChangeStatus: (todo: Todo, status: TodoStatus) => void
}

function TodoItem({ todo, onChangeStatus }: TodoItemProps) {
  return (
    <li className={`todo todo-${todo.status}`}>
      <div className="todo-main">
        <p className="todo-name">
          <span>{todo.name}</span>
          <span className={`badge badge-${todo.status}`}>
              {STATUS_LABELS[todo.status]}
            </span>
        </p>
        <p className="todo-responsible">{todo.responsible}</p>
      </div>

      <div className="todo-actions">
        {todo.status === 'pending' && (
          <button
            className="button small"
            type="button"
            onClick={() => onChangeStatus(todo, 'working')}
            aria-label={`Mark ${todo.name} as working`}
          >
            Start work
          </button>
        )}

        {todo.status === 'working' && (
          <button
            className="button small danger"
            type="button"
            onClick={() => onChangeStatus(todo, 'done')}
            aria-label={`Complete ${todo.name}`}
          >
            Complete
          </button>
        )}
      </div>
    </li>
  )
}

export function TodoList({
  todos,
  loading,
  error,
  isPending,
  onChangeStatus,
  onRetry,
}: TodoListProps) {
  return (
    <section
      className="panel list-panel"
      aria-busy={loading || isPending}
      aria-label="Todos"
    >
      <header className="list-header">
        <h2>Todos</h2>
        <div className="list-meta">
          {(isPending || loading) && (
            <span className="status-text" role="status">
              {isPending ? 'Saving…' : 'Refreshing…'}
            </span>
          )}
          <span className="count">{todos.length}</span>
        </div>
      </header>

      {error ? (
        <div className="state error" role="alert">
          <p>{error}</p>
          <button className="button ghost" type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : loading && todos.length === 0 ? (
        <div className="state">Loading todos…</div>
      ) : todos.length === 0 ? (
        <div className="state">No todos match the current filters.</div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onChangeStatus={onChangeStatus}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
