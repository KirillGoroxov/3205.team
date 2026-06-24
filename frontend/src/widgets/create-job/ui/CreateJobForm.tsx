import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type CreateJobFormProps = {
  isSubmitting: boolean
  onSubmit: (urls: string[]) => Promise<void>
}

const placeholderUrls = [
  'https://example.com',
  'https://github.com',
  'https://react.dev',
].join('\n')

export function CreateJobForm({ isSubmitting, onSubmit }: CreateJobFormProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const urls = useMemo(
    () =>
      value
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
    [value],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (urls.length === 0) {
      setError('Добавьте хотя бы один URL')
      return
    }

    setError(null)
    await onSubmit(urls)
    setValue('')
  }

  return (
    <form className="panel create-job" onSubmit={handleSubmit}>
      <div className="panel__header">
        <div>
          <h2>Новое задание</h2>
          <p>{urls.length || 0} URL в очереди</p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setError(null)
        }}
        placeholder={placeholderUrls}
        rows={8}
        spellCheck={false}
        aria-label="URL для проверки"
      />

      <div className="form-row">
        <button className="button button--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Запускаем...' : 'Запустить проверку'}
        </button>
        {error && <span className="form-error">{error}</span>}
      </div>
    </form>
  )
}
