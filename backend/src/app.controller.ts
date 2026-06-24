import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import type { CreateJobDto } from './app.service';

@Controller('api/jobs')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createJob(@Body() body: CreateJobDto) {
    return this.appService.createJob(body);
  }

  @Get()
  getJobs() {
    return this.appService.getJobs();
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.appService.getJob(id);
  }

  @Delete(':id')
  cancelJob(@Param('id') id: string) {
    return this.appService.cancelJob(id);
  }
}
