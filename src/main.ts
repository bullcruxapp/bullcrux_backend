import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — solo permite requests desde el frontend oficial
  app.enableCors({
    origin: [
      process.env.URL_FRONTEND,   // https://test.bullcruxapp.com (test) o https://bullcruxapp.com (prod)
      'http://localhost:3000',     // desarrollo local
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global — activa los DTOs en todos los endpoints
  // Sin esto, las validaciones de los DTOs (IsString, IsInt, etc.) no tienen efecto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // ignora campos que no estén en el DTO
      forbidNonWhitelisted: true, // devuelve error si llegan campos no permitidos
      transform: true,       // convierte los tipos automáticamente (ej: string "5" → number 5)
    }),
  );

  await app.listen(PORT);
}
bootstrap();
