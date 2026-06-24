import { useCallback, useEffect, useRef, useState } from 'react'
import type { JobDetails, JobSummary } from '../../../entities/job/model/types'
import { CreateJobForm } from '../../../widgets/create-job/ui/CreateJobForm'
import { JobDetailsPanel } from '../../../widgets/job-details/ui/JobDetailsPanel'
import { JobsList } from '../../../widgets/jobs-list/ui/JobsList'
import { jobsApi } from '../../../shared/api/jobs'
import { terminalJobStatuses } from '../../../shared/lib/jobStatus'

const POLLING_INTERVAL_MS = 1_500

export function JobsPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [activeJob, setActiveJob] = useState<JobDetails | null>(null)
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isListLoading, setIsListLoading] = useState(true)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const detailRequestKeyRef = useRef(0)

  const loadJobs = useCallback(async (signal?: AbortSignal) => {
    setIsListLoading(true)

    try {
      const data = await jobsApi.getList({ signal })
      setJobs(data)
    } catch (caught) {
      if (!signal?.aborted) {
        setError(caught instanceof Error ? caught.message : 'Не удалось загрузить задания')
      }
    } finally {
      if (!signal?.aborted) {
        setIsListLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadInitialJobs = async () => {
      try {
        const data = await jobsApi.getList({ signal: controller.signal })
        setJobs(data)
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Не удалось загрузить задания')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsListLoading(false)
        }
      }
    }

    void loadInitialJobs()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!activeJobId) {
      return
    }

    const requestKey = detailRequestKeyRef.current + 1
    detailRequestKeyRef.current = requestKey
    const controller = new AbortController()
    let timeoutId: number | undefined
    let isStopped = false

    const poll = async () => {
      setIsDetailsLoading(true)

      try {
        const data = await jobsApi.getById(activeJobId, {
          signal: controller.signal,
        })

        if (isStopped || detailRequestKeyRef.current !== requestKey) {
          return
        }

        setActiveJob(data)
        setError(null)

        if (terminalJobStatuses.has(data.status)) {
          void loadJobs()
          return
        }

        timeoutId = window.setTimeout(poll, POLLING_INTERVAL_MS)
      } catch (caught) {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Не удалось загрузить задание')
        }
      } finally {
        if (!controller.signal.aborted && detailRequestKeyRef.current === requestKey) {
          setIsDetailsLoading(false)
        }
      }
    }

    void poll()

    return () => {
      isStopped = true
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [activeJobId, loadJobs])

  const handleCreateJob = async (urls: string[]) => {
    setIsCreating(true)
    setError(null)

    try {
      const { jobId } = await jobsApi.create(urls)
      setActiveJob(null)
      setActiveJobId(jobId)
      await loadJobs()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось создать задание')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelJob = async () => {
    if (!activeJobId) {
      return
    }

    setIsCancelling(true)
    setError(null)

    try {
      const cancelledJob = await jobsApi.cancel(activeJobId)

      if (activeJobId === cancelledJob.id) {
        setActiveJob(cancelledJob)
      }

      await loadJobs()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось отменить задание')
    } finally {
      setIsCancelling(false)
    }
  }

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
          <CreateJobForm isSubmitting={isCreating} onSubmit={handleCreateJob} />
          <JobsList
            activeJobId={activeJobId}
            isLoading={isListLoading}
            jobs={jobs}
            onSelect={(jobId) => {
              setActiveJob(null)
              setActiveJobId(jobId)
            }}
          />
        </aside>
        <JobDetailsPanel
          isCancelling={isCancelling}
          isLoading={isDetailsLoading}
          job={activeJob}
          onCancel={handleCancelJob}
        />
      </div>
    </main>
  )
}
