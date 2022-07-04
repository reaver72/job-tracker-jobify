import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs/jobs.controller';
import { JobsModule } from './jobs/jobs.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url:process.env.DATABASE_URL,
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: false,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
    JobsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/api/v1/auth/login', method: RequestMethod.POST },
        { path: '/api/v1/auth/register', method: RequestMethod.POST },
      )
      .forRoutes(JobsController, UsersController);
  }
}
