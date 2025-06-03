import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RolesGuard } from './auth/guards/roles.guard';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Add this line to serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        return new ValidationPipe().createExceptionFactory()(errors);
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://g5xqwfz1-3000.asse.devtunnels.ms',
      'https://nex-kos.vercel.app',
    ],
    credentials: true,
  });

  // Add global JWT guard
  const jwtAuthGuard = app.get(JwtAuthGuard);
  const rolesGuard = new RolesGuard(app.get(Reflector));
  app.useGlobalGuards(jwtAuthGuard, rolesGuard);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Register global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 5005);
}
bootstrap();
