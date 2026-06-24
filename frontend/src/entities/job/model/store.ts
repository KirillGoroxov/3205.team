import { create } from 'zustand'
import { jobsApi } from '../../../shared/api/jobs'
import { terminalJobStatuses } from '../../../shared/lib/jobStatus'
import type { JobDetails, JobSummary } from './types'

const POLLING_INTERVAL_MS = 1_500

let pollingController: AbortController | null = null
let pollingTimeoutId: number | undefined
let pollingRequestKey = 0

type JobsState = {
  activeJob: JobDetails | null
  activeJobId: string | null
  error: string | null
  isCancelling: boolean
  isCreating: boolean
  isDetailsLoading: boolean
  isListLoading: boolean
  jobs: JobSummary[]
  cancelActiveJob: () => Promise<void>
  createJob: (urls: string[]) => Promise<void>
  loadJobs: () => Promise<void>
  selectJob: (jobId: string) => void
  stopPolling: () => void
}

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback

const resetPolling = () => {
  pollingRequestKey += 1
  pollingController?.abort()
  pollingController = null
  window.clearTimeout(pollingTimeoutId)
  pollingTimeoutId = undefined
}

export const useJobsStore = create<JobsState>((set, get) => {
  const loadJobs = async () => {
    set({ isListLoading: true })

    try {
      const jobs = await jobsApi.getList()
      set({ jobs })
    } catch (caught) {
      set({
        error: getErrorMessage(caught, 'Не удалось загрузить задания'),
      })
    } finally {
      set({ isListLoading: false })
    }
  }

  const startPolling = (jobId: string) => {
    resetPolling()

    const requestKey = pollingRequestKey
    pollingController = new AbortController()

    const poll = async () => {
      const controller = pollingController

      if (!controller) {
        return
      }

      set({ isDetailsLoading: true })

      try {
        const activeJob = await jobsApi.getById(jobId, {
          signal: controller.signal,
        })

        if (controller.signal.aborted || pollingRequestKey !== requestKey) {
          return
        }

        set({ activeJob, error: null })

        if (terminalJobStatuses.has(activeJob.status)) {
          await loadJobs()
          return
        }

        pollingTimeoutId = window.setTimeout(poll, POLLING_INTERVAL_MS)
      } catch (caught) {
        if (!controller.signal.aborted) {
          set({
            error: getErrorMessage(caught, 'Не удалось загрузить задание'),
          })
        }
      } finally {
        if (!controller.signal.aborted && pollingRequestKey === requestKey) {
          set({ isDetailsLoading: false })
        }
      }
    }

    void poll()
  }

  return {
    activeJob: null,
    activeJobId: null,
    error: null,
    isCancelling: false,
    isCreating: false,
    isDetailsLoading: false,
    isListLoading: false,
    jobs: [],

    cancelActiveJob: async () => {
      const { activeJobId } = get()

      if (!activeJobId) {
        return
      }

      set({ error: null, isCancelling: true })

      try {
        const activeJob = await jobsApi.cancel(activeJobId)

        if (get().activeJobId === activeJob.id) {
          set({ activeJob })
        }

        await loadJobs()
      } catch (caught) {
        set({
          error: getErrorMessage(caught, 'Не удалось отменить задание'),
        })
      } finally {
        set({ isCancelling: false })
      }
    },

    createJob: async (urls: string[]) => {
      set({ error: null, isCreating: true })

      try {
        const { jobId } = await jobsApi.create(urls)
        set({ activeJob: null, activeJobId: jobId })
        startPolling(jobId)
        await loadJobs()
      } catch (caught) {
        set({
          error: getErrorMessage(caught, 'Не удалось создать задание'),
        })
      } finally {
        set({ isCreating: false })
      }
    },

    loadJobs,

    selectJob: (jobId: string) => {
      set({ activeJob: null, activeJobId: jobId, error: null })
      startPolling(jobId)
    },

    stopPolling: () => {
      resetPolling()
      set({ isDetailsLoading: false })
    },
  }
})
