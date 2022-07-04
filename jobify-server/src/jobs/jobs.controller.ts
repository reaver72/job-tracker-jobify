import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiTags, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('/api/v1/jobs')
@ApiTags('jobs')
@ApiSecurity('access_token')
export class JobsController {
  constructor(private jobsService: JobsService) {}
  @Get()
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({
    name: 'sort',
    enum: ['latest', 'oldest', 'a-z', 'z-a'],
    required: false,
  })
  @ApiQuery({ name: 'search', type: 'string', required: false })
  @ApiQuery({
    name: 'status',
    enum: ['all', 'pending', 'declined', 'interview'],
  })
  @ApiQuery({
    name: 'jobType',
    enum: ['all', 'full_time', 'part_time', 'remote', 'internship'],
  })
  getAllJobs(@Query() query: string, @Request() req: any) {
    return this.jobsService.getAlljobs(query, req.raw);
  }
  @Post()
  createJob(@Body() body: CreateJobDto, @Request() req: any): Promise<any> {
    return this.jobsService.createJob(body, req.raw);
  }
  @Get('/stats')
  getJobStats(@Request() req: any) {
    return this.jobsService.getJobStats(req.raw);
  }
  @Patch('/:id')
  updateJob(
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.updateJob(id, body, req.raw);
  }
  @Delete('/:id')
  deleteJob(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.deleteJob(id, req.raw);
  }
}
