import { useState } from 'react'
import {
  EMPTY_FILTERS,
  STATUS_LABELS,
  TODO_STATUSES,
} from '../types'
import type { TodoFilters as Filters, TodoStatus } from '../types'

interface TodoFiltersProps {
  filters: Filters
  onApply: (filters: Filters) => void
  onClear: () => void
}

export function TodoFilters({ filters, onApply, onClear }: TodoFiltersProps) {
  const [draft, setDraft] = useState(filters)

  function update<K extends keyof Filters>(field: K, value: Filters[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function apply() {
    const next: Filters = {
      name: draft.name.trim(),
      responsible: draft.responsible.trim(),
      status: draft.status,
    }

    setDraft(next)
    onApply(next)
  }

  function clear() {
    setDraft({ ...EMPTY_FILTERS })
    onClear()
  }

  return (
    <form className="panel form" action={apply}>
      <h2>Filter</h2>

      <label>
        <span>Name</span>
        <input
          name="name"
          type="search"
          value={draft.name}
          onChange={(event) => update('name', event.target.value)}
          placeholder="Search by name"
        />
      </label>

      <label>
        <span>Responsible</span>
        <input
          name="responsible"
          type="search"
          value={draft.responsible}
          onChange={(event) => update('responsible', event.target.value)}
          placeholder="Search by responsible"
        />
      </label>

      <label>
        <span>Status</span>
        <select
          name="status"
          value={draft.status}
          onChange={(event) =>
            update(
              'status',
              (event.target.value || '') as TodoStatus | '',
            )
          }
        >
          <option value="">All statuses</option>
          {TODO_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <div className="actions">
        <button className="button primary" type="submit">
          Apply filters
        </button>
        <button className="button ghost" type="button" onClick={clear}>
          Clear
        </button>
      </div>
    </form>
  )
}
