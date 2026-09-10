import { Module, OnModuleInit } from '@nestjs/common';
import { AppDataSource } from './data-source';
@Module({})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  }
}
