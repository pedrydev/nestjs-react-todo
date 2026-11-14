import type { CreateTodoInput, Todo, TodoFilters, TodoStatus } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface ErrorBody {
  message?: string | string[]
  error?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody

    if (Array.isArray(body.message)) {
      return body.message.join(', ')
    }

    if (typeof body.message === 'string') {
      return body.message
    }

    if (typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // Non-JSON error response.
  }

  return `Request failed with status ${response.status}`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function listTodos(
  filters: TodoFilters,
  signal?: AbortSignal,
): Promise<Todo[]> {
  const params = new URLSearchParams()
  const name = filters.name.trim()
  const responsible = filters.responsible.trim()

  if (name) {
    params.set('name', name)
  }

  if (responsible) {
    params.set('responsible', responsible)
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  const query = params.toString()
  return request<Todo[]>(`/todos${query ? `?${query}` : ''}`, { signal })
}

export function createTodo(input: CreateTodoInput): Promise<Todo> {
  return request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTodoStatus(
  id: string,
  status: TodoStatus,
): Promise<Todo> {
  return request<Todo>(`/todos/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
