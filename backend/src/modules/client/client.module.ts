import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  providers: [ClientService, PrismaService],
  controllers: [ClientController],
  exports: [ClientService]
})
export class ClientModule {}
