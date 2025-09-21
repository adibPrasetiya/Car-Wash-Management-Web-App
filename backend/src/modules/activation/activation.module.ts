import { Module } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { ActivationController } from './activation.controller';

@Module({
  providers: [ActivationService],
  controllers: [ActivationController]
})
export class ActivationModule {}
