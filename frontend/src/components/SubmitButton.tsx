import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: string
  pendingLabel: string
  className?: string
}

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
