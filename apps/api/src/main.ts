import { NestFactory } from '@nestjs/core';
import { dump } from 'js-yaml';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  if (process.env.NODE_ENV === 'development') {
    const swaggerConfig = new DocumentBuilder().setTitle('@monju/api').setVersion('0.0.1').build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    writeFileSync('../../openapi.yml', dump(document));
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(8000);
}

bootstrap();
