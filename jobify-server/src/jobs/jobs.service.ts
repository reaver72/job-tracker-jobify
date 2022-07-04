import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, JobType } from 'src/models/entities/job.entity';
import { Like, OrderByCondition, Repository } from 'typeorm';
import { readFile } from 'fs/promises';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobsRepo: Repository<Job>,
  ) {}
  async getAlljobs(query: any, req: any) {
    const { status, jobType, sort, search, limit, page } = query;
    const jobLimit = limit || 10;
    const numPages = page || 1;
    const skip = (numPages - 1) * jobLimit;

    const builder = this.jobsRepo
      .createQueryBuilder('job')
      .where('job.createdBy = :id', { id: req.user.id })
      .limit(jobLimit)
      .offset(skip);
    if (status !== 'all') {
      builder.where({ status, createdBy: req.user.id });
    }

    if (jobType !== 'all') {
      builder.where({ jobType, createdBy: req.user.id });
    }

    if (search) {
      builder.where(
        'job.position LIKE :search AND job.createdBy = :id',
        { search: `%${search}%`, id: req.user.id },
      );
    }

    if (sort === 'latest') {
      builder.orderBy('job.createdAt', 'DESC');
    }
    if (sort === 'oldest') {
      builder.orderBy('job.createdAt', 'ASC');
    }
    if (sort === 'a-z') {
      builder.orderBy('job.position', 'ASC');
    }
    if (sort === 'z-a') {
      builder.orderBy('job.position', 'DESC');
    }
    const jobs = await builder.getRawMany();
    const totalJobs = await builder.getCount();
    const totalPages = Math.ceil(totalJobs / jobLimit);
    return { jobs, totalJobs, totalPages };
  }
  async createJob(body: any, req: any): Promise<any> {
    const { position, company, jobLocation } = body;
    if (!position || !company || !jobLocation) {
      throw new BadRequestException('Please provide all required fields');
    }
    body.createdBy = req.user.id;
    const job = await this.jobsRepo.save(body);
    return job;
  }
  async getJobStats(req: any) {
    const builder = this.jobsRepo.createQueryBuilder('job');
    const [_I, interview] = await this.jobsRepo.findAndCount({
      where: { createdBy: req.user.id, status: 'interview' },
    });
    const [_P, pending] = await this.jobsRepo.findAndCount({
      where: { createdBy: req.user.id, status: 'pending' },
    });
    const [_D, declined] = await this.jobsRepo.findAndCount({
      where: { createdBy: req.user.id, status: 'declined' },
    });
    // build typeorm postgres query to get monthlyapplications by month and year
    builder
      .select(
        'EXTRACT(MONTH FROM job.createdAt) as month, EXTRACT(YEAR FROM job.createdAt) as year',
      )
      .addSelect('COUNT(*) as count')
      .groupBy('month, year')
      .where('job.createdBy = :id', { id: req.user.id })
      .limit(6)
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC');

    const monthlyApplications = await builder.getRawMany();
    monthlyApplications.forEach((application) => {
      application.month = new Date(0, application.month, 0).toLocaleString(
        'default',
        {
          month: 'short',
        },
      );
      application.date = `${application.month} ${application.year}`;
    });
    monthlyApplications.reverse();
    return {
      jobStatus: { declined: declined, interview: interview, pending: pending },
      monthlyApplications,
    };
  }

  async updateJob(id: string, body: any, req: any) {
    const { position, company, jobLocation, jobType, status } = body;
    if (!position || !company || !jobLocation) {
      throw new BadRequestException('Please provide all required fields');
    }
    const job = await this.jobsRepo.findOne(id);
    if (!job) {
      throw new BadRequestException('Job not found');
    }
    if (job.createdBy.id !== req.user.id) {
      throw new ForbiddenException('You are not allowed to update this job');
    }
    job.position = position;
    job.company = company;
    job.jobLocation = jobLocation;
    (job.jobType = jobType || 'full_time'), (job.status = status);
    const updatedJob = await this.jobsRepo.save(job);

    return {
      job: {
        id,
        company,
        position,
        jobLocation,
        status: updatedJob.status,
        jobType: updatedJob.jobType,
        createdAt: updatedJob.createdAt,
        updatedAt: updatedJob.updatedAt,
        createdBy: updatedJob.createdBy.id,
      },
    };
  }
  async deleteJob(id: string, req: any) {
    const job = await this.jobsRepo.findOne(id);
    if (!job) {
      throw new BadRequestException('Job not found');
    }
    if (job.createdBy.id !== req.user.id) {
      throw new ForbiddenException('You are not allowed to delete this job');
    }
    await this.jobsRepo.delete(id);
    return 'Job deleted';
  }
}
