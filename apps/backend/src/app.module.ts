import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './core/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ReportModule } from './modules/report/report.module';
import { AuditModule } from './modules/audit/audit.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { SpotlightModule } from './modules/spotlight/spotlight.module';
import { AppController } from './app.controller';
@Module({
  imports: [DatabaseModule, AuthModule, ProductModule, OrderModule, ReportModule, AuditModule, CouponModule, SpotlightModule],
  controllers: [AppController],
})
export class AppModule {}
