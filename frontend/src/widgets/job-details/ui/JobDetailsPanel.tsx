import type { JobDetails } from '../../../entities/job/model/types'
import { CancelJobButton } from '../../../features/cancel-job/ui/CancelJobButton'
import {
  formatDateTime,
  formatShortId,
  getProcessedCount,
  jobStatusLabel,
  statusTone,
  urlStatusLabel,
} from '../../../shared/lib/jobStatus'

type JobDetailsPanelProps = {
  job: JobDetails | null
  isLoading: boolean
  isCancelling: boolean
  onCancel: () => Promise<void>
}

export function JobDetailsPanel({
  job,
  isLoading,
  isCancelling,
  onCancel,
}: JobDetailsPanelProps) {
  if (!job) {
    return (
      <section className="panel job-details job-details--empty">
        <div className="empty-state">Выберите задание из списка</div>
      </section>
    )
  }

  const processed = getProcessedCount(job.urls)
  const progress = job.urls.length > 0 ? (processed / job.urls.length) * 100 : 0

  return (
    <section className="panel job-details">
      <div className="panel__header panel__header--split">
        <div>
          <h2>Задание #{formatShortId(job.id)}</h2>
          <p>{formatDateTime(job.createdAt)}</p>
        </div>
        <span className="status-pill" data-tone={statusTone[job.status]}>
          {jobStatusLabel[job.status]}
        </span>
      </div>

      <div className="progress-block">
        <div className="progress-block__meta">
          <strong>
            {processed} из {job.urls.length} обработано
          </strong>
          <span>{isLoading ? 'Идет опрос статуса' : 'Данные актуальны'}</span>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="details-actions">
        <CancelJobButton
          isCancelling={isCancelling}
          onCancel={onCancel}
          status={job.status}
        />
      </div>

      <div className="url-table">
        <div className="url-table__head">
          <span>URL</span>
          <span>Статус</span>
          <span>HTTP</span>
          <span>Ошибка</span>
        </div>

        {job.urls.map((item) => (
          <div className="url-table__row" key={item.url}>
            <span className="url-cell" title={item.url}>
              {item.url}
            </span>
            <span>
              <span className="status-pill" data-tone={statusTone[item.status]}>
                {urlStatusLabel[item.status]}
              </span>
            </span>
            <span>{item.httpStatus ?? '-'}</span>
            <span className="error-cell">{item.error ?? '-'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
