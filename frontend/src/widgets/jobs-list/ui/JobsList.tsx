import type { JobSummary } from '../../../entities/job/model/types'
import {
  formatDateTime,
  formatShortId,
  jobStatusLabel,
  statusTone,
} from '../../../shared/lib/jobStatus'

type JobsListProps = {
  activeJobId: string | null
  jobs: JobSummary[]
  isLoading: boolean
  onSelect: (id: string) => void
}

export function JobsList({
  activeJobId,
  jobs,
  isLoading,
  onSelect,
}: JobsListProps) {
  return (
    <section className="panel jobs-list">
      <div className="panel__header">
        <div>
          <h2>Последние задания</h2>
          <p>{isLoading ? 'Обновляем список' : `${jobs.length} в истории`}</p>
        </div>
      </div>

      <div className="jobs-list__items">
        {jobs.length === 0 && (
          <div className="empty-state">Заданий пока нет</div>
        )}

        {jobs.map((job) => (
          <button
            className="job-card"
            data-active={job.id === activeJobId}
            key={job.id}
            onClick={() => onSelect(job.id)}
            type="button"
          >
            <span className="job-card__topline">
              <span className="job-card__id">#{formatShortId(job.id)}</span>
              <span
                className="status-pill"
                data-tone={statusTone[job.status]}
              >
                {jobStatusLabel[job.status]}
              </span>
            </span>
            <span className="job-card__date">{formatDateTime(job.createdAt)}</span>
            <span className="job-card__stats">
              <span>{job.urlCount} URL</span>
              <span>{job.stats.success} OK</span>
              <span>{job.stats.error} ошибок</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
