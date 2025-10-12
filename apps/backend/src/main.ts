import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Serve static files (for PDF downloads)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sistema de Facturación PagoPy')
    .setDescription('API para sistema de facturación electrónica Paraguay')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('sales', 'Gestión de ventas')
    .addTag('invoices', 'Gestión de facturas electrónicas')
    .addTag('payments', 'Gestión de pagos')
    .addTag('products', 'Gestión de productos')
    .addTag('customers', 'Gestión de clientes')
    .addTag('reports', 'Reportes y estadísticas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  console.log(`
    ========================================
    🚀 Backend PagoPy running on port ${port}
    📚 API Docs: http://localhost:${port}/api/docs
    🌐 Environment: ${process.env['NODE_ENV'] || 'development'}
    ========================================
  `);
}

bootstrap();
