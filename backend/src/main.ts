import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Fungsi untuk memvalidasi data yang dikirim ke server
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
