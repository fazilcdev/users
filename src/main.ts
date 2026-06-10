import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  global['config'] = { ...process.env, ...(dotenv.config().parsed || {}) };
  const app = await NestFactory.create(AppModule);

  const allowed = (global['config'].ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length > 0) {
    app.enableCors({ origin: allowed, credentials: true });
  } else {
    console.warn('[security] ALLOWED_ORIGINS not set — reflecting request origin (dev only).');
    app.enableCors({ origin: true, credentials: true });
  }
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const microservice = app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      url: global['config'].NATS_URL,
      maxReconnectAttempts: -1,
      //@ts-ignore
      // waitOnFirstConnect: true,
      queue: `${global['config'].APP_NAME}-${global['config'].NODE_ENV}`,
    },
  });

  await app.startAllMicroservices().catch(e => console.log(e));
  app.setGlobalPrefix(`${global['config'].APP_NAME}`);
  await app.listen(global['config'].PORT);
}
bootstrap();
