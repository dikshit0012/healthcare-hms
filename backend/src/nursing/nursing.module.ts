import { Module } from '@nestjs/common';
import { NursingService } from './nursing.service';
import { NursingController } from './nursing.controller';

@Module({
  providers: [NursingService],
  controllers: [NursingController],
  exports: [NursingService],
})
export class NursingModule {}
