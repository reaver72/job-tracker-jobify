import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsNotEmpty()
  @IsOptional()
  firstname: string;
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsNotEmpty()
  @IsOptional()
  lastname: string;
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;
  @IsOptional()
  @ApiProperty()
  location: string;
}
