import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';
import { Bed } from './entities/bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bed])],
  controllers: [BedsController],
  providers: [BedsService],
  exports: [BedsService],
})
export class BedsModule {}
