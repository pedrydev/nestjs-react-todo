import { useActionState, useState } from 'react'
import { createTodo, getErrorMessage } from '../api'
import type { Todo } from '../types'
import { SubmitButton } from './SubmitButton'

interface CreateState {
  status: 'idle' | 'error' | 'success'
  message: string | null
}

const INITIAL_STATE: CreateState = { status: 'idle', message: null }

interface CreateTodoFormProps {
  onCreated: (todo: Todo) => void
}

export function CreateTodoForm({ onCreated }: CreateTodoFormProps) {
  const [name, setName] = useState('')
  const [responsible, setResponsible] = useState('')

  const [state, formAction] = useActionState(
    async (_previous: CreateState, formData: FormData): Promise<CreateState> => {
      const nextName = String(formData.get('name') ?? '').trim()
      const nextResponsible = String(formData.get('responsible') ?? '').trim()

      if (!nextName || !nextResponsible) {
        return {
          status: 'error',
          message: 'Name and responsible are required.',
        }
      }

      try {
        const todo = await createTodo({
          name: nextName,
          responsible: nextResponsible,
        })

        onCreated(todo)
        setName('')
        setResponsible('')

        return { status: 'success', message: `Added "${todo.name}".` }
      } catch (cause) {
        return { status: 'error', message: getErrorMessage(cause) }
      }
    },
    INITIAL_STATE,
  )

  return (
    <form className="panel form" action={formAction}>
      <h2>Add a todo</h2>

      <label>
        <span>Name</span>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Write the release notes"
          autoComplete="off"
          maxLength={120}
          required
        />
      </label>

      <label>
        <span>Responsible</span>
        <input
          name="responsible"
          type="text"
          value={responsible}
          onChange={(event) => setResponsible(event.target.value)}
          placeholder="Ada Lovelace"
          autoComplete="off"
          maxLength={80}
          required
        />
      </label>

      <SubmitButton className="button primary" pendingLabel="Adding…">
        Add todo
      </SubmitButton>

      {state.message && (
        <p
          className={`feedback ${state.status === 'error' ? 'error' : 'success'}`}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
