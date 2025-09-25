import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, PrismaService],
})
export class DiscountModule {}
