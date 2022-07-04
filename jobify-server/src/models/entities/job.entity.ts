import { type } from 'os';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type JobStatus = 'pending' | 'ongoing' | 'completed';
export type JobType = 'full_time' | 'part_time' | 'contract'| 'internship'| 'remote';
@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  company: string;
  @Column()
  position: string;
  @Column({
    type: 'enum',
    enum: ['interview', 'pending', 'declined'],
    default: "pending",
  })
  status: JobStatus;
  @Column({
    type: 'enum',
    enum: ['full_time', 'part_time', 'contract', 'internship', 'remote'],
    default: 'full_time',
  })
  jobType: JobType;

  @Column()
  jobLocation: string;

  @ManyToOne(() => User, (user) => user.jobs, { eager: true })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
