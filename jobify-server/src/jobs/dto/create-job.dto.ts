import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  position: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobLocation: string;
  @ApiProperty()
  @IsEnum(['interview', 'declined', 'pending'])
  @IsOptional()
  status: string;
  @ApiProperty()
  @IsEnum(['full_time', 'part_time', 'contract', 'internship', 'remote'])
  @IsOptional()
  jobType: string;
}
