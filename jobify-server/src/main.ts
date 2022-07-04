import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify"
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.useGlobalPipes(new ValidationPipe());
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Jobify API')
    .setDescription('Jobify API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'PASETO', name: 'Authorization', in: 'header' }, 'access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document);
  app.enableCors({ origin: '*', credentials: true });
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, "0.0.0.0", ()=>console.log(`Server listening on port ${PORT}`));
}
bootstrap();
