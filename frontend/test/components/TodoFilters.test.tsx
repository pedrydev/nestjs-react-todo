import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TodoFilters as Filters } from '../../src/types'
import { TodoFilters } from '../../src/components/TodoFilters'

const EMPTY: Filters = { name: '', status: '', responsible: '' }

function submitForm(): void {
  fireEvent.submit(
    screen.getByRole('button', { name: 'Apply filters' }).closest('form')!,
  )
}

describe('TodoFilters', () => {
  it('initializes the draft from the provided filters', () => {
    render(
      <TodoFilters
        filters={{ name: 'write', status: 'done', responsible: 'Ada' }}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Name')).toHaveValue('write')
    expect(screen.getByLabelText('Responsible')).toHaveValue('Ada')
    expect(screen.getByLabelText('Status')).toHaveValue('completed')
  })

  it('applies trimmed filters', () => {
    const onApply = vi.fn()

    render(
      <TodoFilters filters={EMPTY} onApply={onApply} onClear={vi.fn()} />,
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  release  ' },
    })
    fireEvent.change(screen.getByLabelText('Responsible'), {
      target: { value: '  Ada  ' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'created' },
    })
    submitForm()

    expect(onApply).toHaveBeenCalledWith({
      name: 'release',
      responsible: 'Ada',
      status: 'created',
    })
    expect(screen.getByLabelText('Name')).toHaveValue('release')
  })

  it('lists every status option plus the all option', () => {
    render(
      <TodoFilters filters={EMPTY} onApply={vi.fn()} onClear={vi.fn()} />,
    )

    const options = screen
      .getAllByRole('option')
      .map((option) => (option as HTMLOptionElement).value)

    expect(options).toEqual(['', 'created', 'completed', 'deleted'])
  })

  it('clears the draft and notifies the parent', () => {
    const onClear = vi.fn()

    render(
      <TodoFilters
        filters={{ name: 'write', status: 'done', responsible: 'Ada' }}
        onApply={vi.fn()}
        onClear={onClear}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Responsible')).toHaveValue('')
    expect(screen.getByLabelText('Status')).toHaveValue('')
  })
})
