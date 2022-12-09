import { PrismaService } from './prisma.service';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [PrismaService, ConfigService],
  exports: [PrismaService],
})
export class PrismaModule {}
