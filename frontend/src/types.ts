export const TODO_STATUSES = ['pending', 'working', 'done'] as const

export type TodoStatus = (typeof TODO_STATUSES)[number]

export interface Todo {
  id: string
  name: string
  status: TodoStatus
  responsible: string
}

export interface CreateTodoInput {
  name: string
  responsible: string
}

export interface TodoFilters {
  name: string
  status: TodoStatus | ''
  responsible: string
}

export const EMPTY_FILTERS: TodoFilters = {
  name: '',
  status: '',
  responsible: '',
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: 'Pending',
  working: 'Working',
  done: 'Done',
}

export function matchesFilters(todo: Todo, filters: TodoFilters): boolean {
  if (filters.status && todo.status !== filters.status) {
    return false
  }

  const name = filters.name.trim().toLowerCase()
  if (name && !todo.name.toLowerCase().includes(name)) {
    return false
  }

  const responsible = filters.responsible.trim().toLowerCase()
  if (responsible && !todo.responsible.toLowerCase().includes(responsible)) {
    return false
  }

  return true
}
