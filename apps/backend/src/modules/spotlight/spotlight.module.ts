import { Module } from '@nestjs/common';
import { SpotlightService } from './spotlight.service';
import { SpotlightController } from './spotlight.controller';

@Module({
  providers: [SpotlightService],
  controllers: [SpotlightController],
  exports: [SpotlightService],
})
export class SpotlightModule {}
