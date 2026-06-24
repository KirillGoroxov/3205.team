import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type request from 'supertest';

describe('Jobs API (e2e)', () => {
  let app: INestApplication<App>;
  let httpRequest: typeof request;

  beforeEach(async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    jest.spyOn(global.Math, 'random').mockReturnValue(0);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpRequest = (await import('supertest')).default;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('creates and returns jobs', async () => {
    const createResponse = await httpRequest(app.getHttpServer())
      .post('/api/jobs')
      .send({ urls: ['https://example.com'] })
      .expect(201);

    expect(createResponse.body.jobId).toEqual(expect.any(String));

    await httpRequest(app.getHttpServer())
      .get('/api/jobs')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          expect.objectContaining({
            id: createResponse.body.jobId,
            urlCount: 1,
            stats: expect.objectContaining({
              success: expect.any(Number),
              error: expect.any(Number),
            }),
          }),
        ]);
      });
  });

  it('cancels a job', async () => {
    const createResponse = await httpRequest(app.getHttpServer())
      .post('/api/jobs')
      .send({ urls: ['https://example.com'] })
      .expect(201);

    await httpRequest(app.getHttpServer())
      .delete(`/api/jobs/${createResponse.body.jobId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('cancelled');
      });
  });
});
