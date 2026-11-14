import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from '../../src/types'
import { TodoList } from '../../src/components/TodoList'

function todo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'todo-1',
    name: 'Write tests',
    status: 'pending',
    responsible: 'Ada',
    ...overrides,
  }
}

const noop = vi.fn()

function renderList(overrides: Partial<Parameters<typeof TodoList>[0]> = {}) {
  return render(
    <TodoList
      todos={[]}
      loading={false}
      error={null}
      isPending={false}
      onChangeStatus={noop}
      onRetry={noop}
      {...overrides}
    />,
  )
}

describe('TodoList', () => {
  it('shows a loading state when there is nothing to display yet', () => {
    renderList({ loading: true })

    expect(screen.getByText('Loading todos…')).toBeInTheDocument()
    expect(screen.getByLabelText('Todos')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows an empty state when there are no matches', () => {
    renderList()

    expect(
      screen.getByText('No todos match the current filters.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows the error and retries', () => {
    const onRetry = vi.fn()
    renderList({ error: 'Network down', onRetry })

    expect(screen.getByRole('alert')).toHaveTextContent('Network down')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders todos with their status badges', () => {
    renderList({
      todos: [
        todo({ id: '1', name: 'Alpha', responsible: 'Ada' }),
        todo({ id: '2', name: 'Beta', status: 'working', responsible: 'Linus' }),
        todo({ id: '3', name: 'Gamma', status: 'done', responsible: 'Grace' }),
      ],
    })

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('only offers valid status transitions', () => {
    renderList({
      todos: [
        todo({ id: '1', name: 'Alpha', responsible: 'Ada' }),
        todo({ id: '2', name: 'Beta', status: 'working', responsible: 'Linus' }),
        todo({ id: '3', name: 'Gamma', status: 'done', responsible: 'Grace' }),
      ],
    })

    expect(
      screen.getByRole('button', { name: 'Mark Alpha as completed' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete Alpha' }),
    ).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Mark Beta as completed' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Delete Beta' })).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: 'Delete Gamma' })).toBeNull()
  })

  it('reports status changes with the todo and target status', () => {
    const onChangeStatus = vi.fn()
    const created = todo({ id: '1', name: 'Alpha' })
    const completed = todo({ id: '2', name: 'Beta', status: 'done' })

    renderList({
      todos: [created, completed],
      onChangeStatus,
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Mark Alpha as completed' }),
    )
    expect(onChangeStatus).toHaveBeenCalledWith(created, 'completed')

    fireEvent.click(screen.getByRole('button', { name: 'Delete Beta' }))
    expect(onChangeStatus).toHaveBeenCalledWith(completed, 'deleted')
  })

  it('shows saving while a status update is pending', () => {
    renderList({ todos: [todo()], isPending: true })

    expect(screen.getByRole('status')).toHaveTextContent('Saving…')
    expect(screen.getByLabelText('Todos')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows refreshing while reloading with existing todos', () => {
    renderList({ todos: [todo()], loading: true })

    expect(screen.getByRole('status')).toHaveTextContent('Refreshing…')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })
})
