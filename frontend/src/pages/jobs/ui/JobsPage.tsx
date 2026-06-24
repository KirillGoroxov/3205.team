import { useEffect } from 'react'
import { useJobsStore } from '../../../entities/job/model/store'
import { CreateJobForm } from '../../../widgets/create-job/ui/CreateJobForm'
import { JobDetailsPanel } from '../../../widgets/job-details/ui/JobDetailsPanel'
import { JobsList } from '../../../widgets/jobs-list/ui/JobsList'

export function JobsPage() {
  const activeJob = useJobsStore((state) => state.activeJob)
  const activeJobId = useJobsStore((state) => state.activeJobId)
  const cancelActiveJob = useJobsStore((state) => state.cancelActiveJob)
  const createJob = useJobsStore((state) => state.createJob)
  const error = useJobsStore((state) => state.error)
  const isCancelling = useJobsStore((state) => state.isCancelling)
  const isCreating = useJobsStore((state) => state.isCreating)
  const isDetailsLoading = useJobsStore((state) => state.isDetailsLoading)
  const isListLoading = useJobsStore((state) => state.isListLoading)
  const jobs = useJobsStore((state) => state.jobs)
  const loadJobs = useJobsStore((state) => state.loadJobs)
  const selectJob = useJobsStore((state) => state.selectJob)
  const stopPolling = useJobsStore((state) => state.stopPolling)

  useEffect(() => {
    void loadJobs()

    return stopPolling
  }, [loadJobs, stopPolling])

  return (
    <main className="jobs-page">
      <header className="app-header">
        <div>
          <p className="eyebrow">URL checker</p>
          <h1>Проверка доступности URL</h1>
        </div>
        {error && <div className="app-error">{error}</div>}
      </header>

      <div className="jobs-layout">
        <aside className="jobs-sidebar">
          <CreateJobForm isSubmitting={isCreating} onSubmit={createJob} />
          <JobsList
            activeJobId={activeJobId}
            isLoading={isListLoading}
            jobs={jobs}
            onSelect={selectJob}
          />
        </aside>
        <JobDetailsPanel
          isCancelling={isCancelling}
          isLoading={isDetailsLoading}
          job={activeJob}
          onCancel={cancelActiveJob}
        />
      </div>
    </main>
  )
}
