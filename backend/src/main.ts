import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // Fungsi untuk memvalidasi data yang dikirim ke server

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://g5xqwfz1-3000.asse.devtunnels.ms',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Origin',
      'Access-Control-Allow-Origin',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
  });

  // Add global JWT guard
  const jwtAuthGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtAuthGuard);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Register global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 5005);
}
bootstrap();
