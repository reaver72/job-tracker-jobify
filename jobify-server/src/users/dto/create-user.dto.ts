import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsNotEmpty()
  firstname: string;
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @IsNotEmpty()
  lastname: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

}
