export type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type UrlStatus =
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'error'
  | 'cancelled'

export type JobStats = {
  success: number
  error: number
}

export type JobSummary = {
  id: string
  createdAt: string
  status: JobStatus
  urlCount: number
  stats: JobStats
}

export type UrlCheck = {
  url: string
  status: UrlStatus
  httpStatus?: number
  error?: string
  startedAt?: string
  finishedAt?: string
  durationMs?: number
}

export type JobDetails = {
  id: string
  createdAt: string
  status: JobStatus
  urls: UrlCheck[]
}
