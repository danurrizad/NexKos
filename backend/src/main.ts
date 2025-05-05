import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Fungsi untuk memvalidasi data yang dikirim ke server

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins
    // origin: ['http://localhost:3000', 'https://yourdomain.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Add global JWT guard
  const jwtAuthGuard = app.get(JwtAuthGuard);
  app.useGlobalGuards(jwtAuthGuard);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
