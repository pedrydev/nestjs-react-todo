import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  createTodo,
  getErrorMessage,
  listTodos,
  updateTodoStatus,
} from '../src/api'
import type { Todo } from '../src/types'

const TODO: Todo = {
  id: 'todo-1',
  name: 'Write tests',
  status: 'created',
  responsible: 'Ada',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('listTodos', () => {
  it('requests all todos when filters are empty', async () => {
    fetchMock.mockResolvedValue(jsonResponse([TODO]))

    await expect(
      listTodos({ name: '  ', status: '', responsible: '' }),
    ).resolves.toEqual([TODO])

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:3000/todos')
  })

  it('trims and serializes filters into the query string', async () => {
    fetchMock.mockResolvedValue(jsonResponse([TODO]))

    await listTodos({
      name: '  write ',
      status: 'completed',
      responsible: ' Ada ',
    })

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://localhost:3000/todos?name=write&responsible=Ada&status=completed',
    )
  })

  it('passes the abort signal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    const controller = new AbortController()

    await listTodos({ name: '', status: '', responsible: '' }, controller.signal)

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal)
  })
})

describe('createTodo', () => {
  it('posts the input as JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(TODO, 201))

    await expect(
      createTodo({ name: 'Write tests', responsible: 'Ada' }),
    ).resolves.toEqual(TODO)

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('http://localhost:3000/todos')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(
      JSON.stringify({ name: 'Write tests', responsible: 'Ada' }),
    )
    expect(new Headers(init?.headers).get('Content-Type')).toBe(
      'application/json',
    )
    expect(new Headers(init?.headers).get('Accept')).toBe('application/json')
  })
})

describe('updateTodoStatus', () => {
  it('patches the encoded id with the new status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...TODO, status: 'completed' }))

    await updateTodoStatus('todo/1', 'completed')

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('http://localhost:3000/todos/todo%2F1/status')
    expect(init?.method).toBe('PATCH')
    expect(init?.body).toBe(JSON.stringify({ status: 'completed' }))
  })
})

describe('error handling', () => {
  it('returns undefined for 204 responses', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(
      updateTodoStatus('todo-1', 'deleted'),
    ).resolves.toBeUndefined()
  })

  it('joins array validation messages', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: ['name should not be empty'] }, 400),
    )

    await expect(
      createTodo({ name: '', responsible: 'Ada' }),
    ).rejects.toThrowError(new ApiError('name should not be empty', 400))
  })

  it('uses a string message when present', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

    await expect(updateTodoStatus('missing', 'completed')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Not found',
    })
  })

  it('falls back to the error field', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Bad Request' }, 400))

    await expect(
      createTodo({ name: 'x', responsible: 'y' }),
    ).rejects.toThrowError('Bad Request')
  })

  it('falls back to the status when the body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('oops', { status: 500, statusText: 'Server Error' }),
    )

    await expect(
      listTodos({ name: '', status: '', responsible: '' }),
    ).rejects.toThrowError('Request failed with status 500')
  })
})

describe('getErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('returns a generic message for unknown values', () => {
    expect(getErrorMessage('boom')).toBe('Something went wrong.')
    expect(getErrorMessage(undefined)).toBe('Something went wrong.')
  })
})
