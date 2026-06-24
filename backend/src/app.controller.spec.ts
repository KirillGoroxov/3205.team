import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    jest.spyOn(global.Math, 'random').mockReturnValue(0);

    appController = new AppController(new AppService());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a job', () => {
    const result = appController.createJob({
      urls: ['https://example.com'],
    });

    expect(result.jobId).toEqual(expect.any(String));
  });

  it('lists created jobs', () => {
    const { jobId } = appController.createJob({
      urls: ['https://example.com'],
    });

    expect(appController.getJobs()).toEqual([
      expect.objectContaining({
        id: jobId,
        urlCount: 1,
        stats: {
          success: 0,
          error: 0,
        },
      }),
    ]);
  });
});
