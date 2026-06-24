import type { JobDetails, JobSummary } from '../../entities/job/model/types'

type RequestOptions = {
  signal?: AbortSignal
}

const parseJson = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  const fallback = `Request failed with status ${response.status}`
  let message: string | undefined

  try {
    const body = (await response.json()) as { message?: string | string[] }
    message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message
  } catch {
    throw new Error(fallback)
  }

  throw new Error(message || fallback)
}

export const jobsApi = {
  async create(urls: string[], options?: RequestOptions) {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
      signal: options?.signal,
    })

    return parseJson<{ jobId: string }>(response)
  },

  async getList(options?: RequestOptions) {
    const response = await fetch('/api/jobs', {
      signal: options?.signal,
    })

    return parseJson<JobSummary[]>(response)
  },

  async getById(id: string, options?: RequestOptions) {
    const response = await fetch(`/api/jobs/${id}`, {
      signal: options?.signal,
    })

    return parseJson<JobDetails>(response)
  },

  async cancel(id: string, options?: RequestOptions) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      signal: options?.signal,
    })

    return parseJson<JobDetails>(response)
  },
}
