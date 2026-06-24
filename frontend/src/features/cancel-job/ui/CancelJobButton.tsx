import type { JobStatus } from '../../../entities/job/model/types'
import { terminalJobStatuses } from '../../../shared/lib/jobStatus'

type CancelJobButtonProps = {
  status: JobStatus
  isCancelling: boolean
  onCancel: () => Promise<void>
}

export function CancelJobButton({
  status,
  isCancelling,
  onCancel,
}: CancelJobButtonProps) {
  const isDisabled = terminalJobStatuses.has(status) || isCancelling

  return (
    <button
      className="button button--danger"
      disabled={isDisabled}
      onClick={onCancel}
      type="button"
    >
      {isCancelling ? 'Отменяем...' : 'Отменить задание'}
    </button>
  )
}
