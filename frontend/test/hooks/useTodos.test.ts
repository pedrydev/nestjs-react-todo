import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listTodos } from '../../src/api'
import type { Todo, TodoFilters } from '../../src/types'
import { useTodos } from '../../src/hooks/useTodos'

vi.mock('../../src/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api')>()
  return { ...actual, listTodos: vi.fn() }
})

const listTodosMock = vi.mocked(listTodos)

const EMPTY: TodoFilters = { name: '', status: '', responsible: '' }

function todo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    name: 'Write tests',
    status: 'pending',
    responsible: 'Ada',
    ...overrides,
  }
}

beforeEach(() => {
  listTodosMock.mockReset()
})

describe('useTodos', () => {
  it('starts loading and exposes the fetched todos', async () => {
    const todos = [todo()]
    listTodosMock.mockResolvedValue(todos)

    const { result } = renderHook(() => useTodos(EMPTY))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.todos).toEqual(todos)
    expect(result.current.error).toBeNull()
    expect(listTodosMock).toHaveBeenCalledWith(EMPTY, expect.any(AbortSignal))
  })

  it('refetches when the filters change', async () => {
    listTodosMock.mockResolvedValue([])

    const { rerender } = renderHook(({ filters }) => useTodos(filters), {
      initialProps: { filters: EMPTY },
    })

    await waitFor(() => expect(listTodosMock).toHaveBeenCalledTimes(1))

    rerender({ filters: { ...EMPTY, status: 'done' } })

    await waitFor(() => expect(listTodosMock).toHaveBeenCalledTimes(2))
    expect(listTodosMock).toHaveBeenLastCalledWith(
      { ...EMPTY, status: 'completed' },
      expect.any(AbortSignal),
    )
  })

  it('exposes the request error', async () => {
    listTodosMock.mockRejectedValue(new Error('Network down'))

    const { result } = renderHook(() => useTodos(EMPTY))

    await waitFor(() => expect(result.current.error).toBe('Network down'))
    expect(result.current.loading).toBe(false)
    expect(result.current.todos).toEqual([])
  })

  it('ignores errors from aborted requests', async () => {
    let rejectRequest: (error: unknown) => void = () => {}
    listTodosMock.mockImplementation(
      () =>
        new Promise<Todo[]>((_resolve, reject) => {
          rejectRequest = reject
        }),
    )

    const { result, unmount } = renderHook(() => useTodos(EMPTY))
    unmount()
    rejectRequest(new Error('aborted'))

    await Promise.resolve()
    expect(result.current.error).toBeNull()
  })

  it('aborts the in-flight request on unmount', async () => {
    let signal: AbortSignal | undefined
    listTodosMock.mockImplementation((_filters, requestSignal) => {
      signal = requestSignal
      return new Promise<Todo[]>(() => {})
    })

    const { unmount } = renderHook(() => useTodos(EMPTY))
    unmount()

    expect(signal?.aborted).toBe(true)
  })

  it('reload triggers a new request and reports loading again', async () => {
    listTodosMock.mockResolvedValue([])

    const { result } = renderHook(() => useTodos(EMPTY))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.reload())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(listTodosMock).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('upserts matching todos and keeps the list sorted by name', async () => {
    listTodosMock.mockResolvedValue([todo({ id: 'b', name: 'Beta' })])

    const { result } = renderHook(() => useTodos(EMPTY))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.upsert(todo({ id: 'a', name: 'Alpha' }))
    })

    expect(result.current.todos.map((item) => item.name)).toEqual([
      'Alpha',
      'Beta',
    ])

    act(() => {
      result.current.upsert(todo({ id: 'b', name: 'Beta', status: 'done' }))
    })

    expect(result.current.todos).toHaveLength(2)
    expect(result.current.todos.find((item) => item.id === 'b')?.status).toBe(
      'completed',
    )
  })

  it('does not add upserted todos that do not match the active filters', async () => {
    listTodosMock.mockResolvedValue([])
    const filters: TodoFilters = { ...EMPTY, status: 'done' }

    const { result } = renderHook(() => useTodos(filters))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.upsert(todo({ status: 'pending' }))
    })

    expect(result.current.todos).toEqual([])
  })
})
