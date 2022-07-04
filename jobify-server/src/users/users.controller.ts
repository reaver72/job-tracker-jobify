import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
@Controller('api/v1/auth')
@ApiTags('user')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post('/register')
  async registerUser(@Body() body: CreateUserDto) {
    return this.usersService.register(
      body.firstname,
      body.lastname,
      body.email,
      body.password,
    );
  }
  @Post('/login')
  loginUser(@Body() body: LoginUserDto) {
    return this.usersService.login(body.email, body.password);
  }
  @ApiSecurity('access_token')
  @Get('/currentUser')
  getUser(@Request() req: any) {
    return this.usersService.getUser(req.raw);
  }
  @ApiSecurity('access_token')
  @Patch('/updateUser')
  updateUser(@Body() body: UpdateUserDto, @Request() req: any) {
    return this.usersService.updateUser(body, req.raw);
  }
}
