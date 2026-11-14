import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTodo } from '../../src/api'
import type { Todo } from '../../src/types'
import { CreateTodoForm } from '../../src/components/CreateTodoForm'

vi.mock('../../src/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/api')>()
  return { ...actual, createTodo: vi.fn() }
})

const createTodoMock = vi.mocked(createTodo)

const TODO: Todo = {
  id: 'todo-1',
  name: 'Write tests',
  status: 'pending',
  responsible: 'Ada',
}

function submitForm(): void {
  const form = document.querySelector('form')
  if (!form) {
    throw new Error('form not rendered')
  }
  fireEvent.submit(form)
}

beforeEach(() => {
  createTodoMock.mockReset()
})

describe('CreateTodoForm', () => {
  it('creates a todo with trimmed values and clears the form', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    createTodoMock.mockResolvedValue(TODO)

    render(<CreateTodoForm onCreated={onCreated} />)

    const name = screen.getByLabelText('Name')
    const responsible = screen.getByLabelText('Responsible')

    await user.type(name, '  Write tests  ')
    await user.type(responsible, '  Ada  ')
    fireEvent.submit(name.closest('form')!)

    await waitFor(() =>
      expect(createTodoMock).toHaveBeenCalledWith({
        name: 'Write tests',
        responsible: 'Ada',
      }),
    )

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(TODO))
    expect(screen.getByRole('status')).toHaveTextContent('Added "Write tests".')
    expect(name).toHaveValue('')
    expect(responsible).toHaveValue('')
  })

  it('rejects empty submissions without calling the API', async () => {
    const onCreated = vi.fn()

    render(<CreateTodoForm onCreated={onCreated} />)
    submitForm()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Name and responsible are required.',
      ),
    )
    expect(createTodoMock).not.toHaveBeenCalled()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('rejects whitespace-only submissions', async () => {
    const user = userEvent.setup()

    render(<CreateTodoForm onCreated={vi.fn()} />)
    await user.type(screen.getByLabelText('Name'), '   ')
    await user.type(screen.getByLabelText('Responsible'), '   ')
    submitForm()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Name and responsible are required.',
      ),
    )
    expect(createTodoMock).not.toHaveBeenCalled()
  })

  it('shows the API error message', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    createTodoMock.mockRejectedValue(new Error('Name already exists'))

    render(<CreateTodoForm onCreated={onCreated} />)

    await user.type(screen.getByLabelText('Name'), 'Write tests')
    await user.type(screen.getByLabelText('Responsible'), 'Ada')
    submitForm()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Name already exists',
      ),
    )
    expect(onCreated).not.toHaveBeenCalled()
  })
})
