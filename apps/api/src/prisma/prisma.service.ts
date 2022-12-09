import { type INestApplication, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { Env } from 'src/common/types/Env';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService<Env, true>) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: ['query', 'warn', 'error', 'info'],
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
