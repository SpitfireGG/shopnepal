import { Module } from '@nestjs/common';
import { AdminGuard } from './auth.guard';
@Module({ providers: [AdminGuard], exports: [AdminGuard] })
export class AuthModule {}
