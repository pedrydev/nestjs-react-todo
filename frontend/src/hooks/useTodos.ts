import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage, listTodos } from '../api'
import { matchesFilters } from '../types'
import type { Todo, TodoFilters } from '../types'

interface TodosState {
  todos: Todo[]
  error: string | null
  requestKey: string | null
}

export function useTodos(filters: TodoFilters) {
  const [state, setState] = useState<TodosState>({
    todos: [],
    error: null,
    requestKey: null,
  })
  const [reloadToken, setReloadToken] = useState(0)

  const { name, status, responsible } = filters
  const requestKey = [name, status, responsible, reloadToken].join('\u0000')

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    listTodos({ name, status, responsible }, controller.signal)
      .then((todos) => {
        if (!active) {
          return
        }

        setState({ todos, error: null, requestKey })
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) {
          return
        }

        setState((current) => ({
          ...current,
          error: getErrorMessage(cause),
          requestKey,
        }))
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [name, status, responsible, requestKey])

  const loading = state.requestKey !== requestKey
  const error = loading ? null : state.error

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const upsert = useCallback(
    (todo: Todo) => {
      setState((current) => {
        const next = current.todos.filter((item) => item.id !== todo.id)

        if (matchesFilters(todo, { name, status, responsible })) {
          next.push(todo)
        }

        return {
          ...current,
          todos: next.toSorted((a, b) => a.name.localeCompare(b.name)),
        }
      })
    },
    [name, status, responsible],
  )

  return { todos: state.todos, loading, error, reload, upsert }
}
