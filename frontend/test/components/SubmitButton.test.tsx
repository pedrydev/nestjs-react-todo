import { render, screen } from '@testing-library/react'
import { useFormStatus } from 'react-dom'
import type { FormStatus } from 'react-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SubmitButton } from '../../src/components/SubmitButton'

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return { ...actual, useFormStatus: vi.fn() }
})

const useFormStatusMock = vi.mocked(useFormStatus)

function formStatus(pending: boolean): FormStatus {
  return pending
    ? {
        pending: true,
        data: new FormData(),
        method: 'post',
        action: '/submit',
      }
    : { pending: false, data: null, method: null, action: null }
}

beforeEach(() => {
  useFormStatusMock.mockReset()
})

describe('SubmitButton', () => {
  it('renders the idle label and stays enabled', () => {
    useFormStatusMock.mockReturnValue(formStatus(false))

    render(
      <SubmitButton className="primary" pendingLabel="Adding…">
        Add todo
      </SubmitButton>,
    )

    const button = screen.getByRole('button', { name: 'Add todo' })
    expect(button).toHaveClass('primary')
    expect(button).toBeEnabled()
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-busy', 'false')
  })

  it('renders the pending label and disables the button while pending', () => {
    useFormStatusMock.mockReturnValue(formStatus(true))

    render(<SubmitButton pendingLabel="Adding…">Add todo</SubmitButton>)

    const button = screen.getByRole('button', { name: 'Adding…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
