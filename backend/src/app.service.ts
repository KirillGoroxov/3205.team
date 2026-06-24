import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

export type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type UrlStatus =
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'error'
  | 'cancelled';

export interface CreateJobDto {
  urls: string[];
}

interface UrlCheck {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
}

@Injectable()
export class AppService {
  private readonly jobs = new Map<string, Job>();
  private readonly concurrencyLimit = 5;

  createJob(body: CreateJobDto): { jobId: string } {
    const urls = this.validateUrls(body);
    const id = randomUUID();

    const job: Job = {
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      urls: urls.map((url) => ({
        url,
        status: 'pending',
      })),
    };

    this.jobs.set(id, job);
    void this.processJob(job);

    return { jobId: id };
  }

  getJobs() {
    return [...this.jobs.values()].map((job) => ({
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      urlCount: job.urls.length,
      stats: this.getStats(job),
    }));
  }

  getJob(id: string) {
    const job = this.findJob(id);

    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      urls: job.urls.map((item) => ({ ...item })),
    };
  }

  cancelJob(id: string) {
    const job = this.findJob(id);

    if (job.status === 'completed' || job.status === 'failed') {
      return this.getJob(id);
    }

    job.status = 'cancelled';
    for (const item of job.urls) {
      if (item.status === 'pending') {
        item.status = 'cancelled';
        item.finishedAt = new Date().toISOString();
      }
    }

    return this.getJob(id);
  }

  private async processJob(job: Job): Promise<void> {
    job.status = 'in_progress';
    let cursor = 0;

    const worker = async () => {
      while (!this.isCancelled(job)) {
        const index = cursor++;
        const item = job.urls[index];

        if (!item) {
          return;
        }

        if (item.status === 'pending') {
          await this.processUrl(job, item);
        }
      }
    };

    try {
      const workerCount = Math.min(this.concurrencyLimit, job.urls.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));

      if (!this.isCancelled(job)) {
        job.status = 'completed';
      }
    } catch {
      job.status = 'failed';
    } finally {
      if (this.isCancelled(job)) {
        for (const item of job.urls) {
          if (item.status === 'pending') {
            item.status = 'cancelled';
            item.finishedAt = new Date().toISOString();
          }
        }
      }
    }
  }

  private async processUrl(job: Job, item: UrlCheck): Promise<void> {
    const started = Date.now();
    item.startedAt = new Date(started).toISOString();
    item.status = 'in_progress';

    let nextStatus: UrlStatus = 'success';
    let httpStatus: number | undefined;
    let error: string | undefined;

    try {
      const response = await fetch(item.url, { method: 'HEAD' });
      httpStatus = response.status;

      if (!response.ok) {
        nextStatus = 'error';
        error = `HTTP ${response.status}`;
      }
    } catch (caught) {
      nextStatus = 'error';
      error = caught instanceof Error ? caught.message : 'HEAD request failed';
    }

    await this.delay(this.randomDelayMs());

    const finished = Date.now();
    item.httpStatus = httpStatus;
    item.error = error;
    item.finishedAt = new Date(finished).toISOString();
    item.durationMs = finished - started;
    item.status = this.isCancelled(job) ? 'cancelled' : nextStatus;
  }

  private validateUrls(body: CreateJobDto): string[] {
    if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
      throw new BadRequestException('urls must be a non-empty array');
    }

    return body.urls.map((url, index) => {
      if (typeof url !== 'string' || url.trim() === '') {
        throw new BadRequestException(
          `urls[${index}] must be a non-empty string`,
        );
      }

      try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error('unsupported protocol');
        }
      } catch {
        throw new BadRequestException(
          `urls[${index}] must be a valid http(s) URL`,
        );
      }

      return url;
    });
  }

  private findJob(id: string): Job {
    const job = this.jobs.get(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  private getStats(job: Job) {
    return {
      success: job.urls.filter((item) => item.status === 'success').length,
      error: job.urls.filter((item) => item.status === 'error').length,
    };
  }

  private randomDelayMs(): number {
    return Math.floor(Math.random() * 10_001);
  }

  private isCancelled(job: Job): boolean {
    return job.status === 'cancelled';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
