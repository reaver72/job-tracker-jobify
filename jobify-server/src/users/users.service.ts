import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from 'src/models/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { V3 } from 'paseto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}
  async register(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ) {
    const duplicateUser = await this.usersRepo.findOne({ email });

    if (duplicateUser) {
      throw new UnprocessableEntityException('Email already in use!');
    }

    const user = await this.usersRepo.save({
      firstname,
      lastname,
      email,
      password,
    });

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
      timeCost: 20,
      parallelism: 5,
      version: 24,
      saltLength: 32,
    });

    const token = await V3.encrypt(
      {
        id: user.id,
      },
      process.env.TOKEN_SECRET,
    );

    const newUser = await this.usersRepo.save({
      ...user,
      password: hashedPassword,
    });

    const registeredUser = {
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        location: newUser.location,
      },
      token,
    };

    return registeredUser;
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ email });

    if (!user) {
      throw new BadRequestException('Incorrect email or password');
    }
    const token = await V3.encrypt(
      {
        id: user.id,
      },
      process.env.TOKEN_SECRET,
    );
    const storedHash = user.password;
    const verifyPassword = await argon2.verify(storedHash, password);
    if (!verifyPassword) {
      throw new BadRequestException('Incorrect email or password!');
    }

    const userId = user.id;
    return { user: { userId }, token };
  }
  async getUser(req: any) {
    const currentUser = await this.usersRepo.findOne({ id: req.user.id });
    return { ...currentUser, password: undefined };
  }
  async updateUser(body: UpdateUserDto, req: any) {
    if (!body.firstname || !body.lastname || !body.email || !body.location) {
      throw new BadRequestException('Please fill in all fields');
    }

    //update user
    const user = await this.usersRepo.findOne({ id: req.user.id });
    if (user.email !== body.email) {
      const duplicateUser = await this.usersRepo.findOne({ email: body.email });
      if (duplicateUser) {
        throw new UnprocessableEntityException(
          'User with this email already exist!',
        );
      }
    }
    const token = await V3.encrypt(
      {
        id: req.user.id,
      },
      process.env.TOKEN_SECRET,
    );
    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.location = body.location;

    const updatedUser = await this.usersRepo.save(user);
    return { user: { ...updatedUser, password: undefined }, token };
  }
}
