import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/client/client.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './config/prisma.module';
import { ActivationModule } from './modules/activation/activation.module';
import { ServiceModule } from './modules/service/service.module';
import { DiscountService } from './modules/discount/discount.service';
import { DiscountController } from './modules/discount/discount.controller';
import { DiscountModule } from './modules/discount/discount.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ClientModule,
    VehicleModule,
    TransactionModule,
    LoyaltyModule,
    UserModule,
    ActivationModule,
    ServiceModule,
    DiscountModule,
  ],
  controllers: [AppController, DiscountController],
  providers: [AppService, DiscountService],
})
export class AppModule {}
