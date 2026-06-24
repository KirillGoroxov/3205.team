import type { JobStatus, UrlStatus } from '../../entities/job/model/types'

export const terminalJobStatuses = new Set<JobStatus>([
  'completed',
  'cancelled',
  'failed',
])

export const jobStatusLabel: Record<JobStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'В работе',
  completed: 'Завершено',
  cancelled: 'Отменено',
  failed: 'Ошибка',
}

export const urlStatusLabel: Record<UrlStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'Проверяется',
  success: 'Доступен',
  error: 'Ошибка',
  cancelled: 'Отменен',
}

export const statusTone: Record<JobStatus | UrlStatus, string> = {
  pending: 'neutral',
  in_progress: 'running',
  completed: 'success',
  success: 'success',
  failed: 'danger',
  error: 'danger',
  cancelled: 'muted',
}

export const getProcessedCount = (statuses: { status: UrlStatus }[]) =>
  statuses.filter((item) =>
    ['success', 'error', 'cancelled'].includes(item.status),
  ).length

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))

export const formatShortId = (id: string) => id.slice(0, 8)
