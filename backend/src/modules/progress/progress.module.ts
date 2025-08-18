import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { UserAlgorithm } from '../../database/entities/user-algorithm.entity';
import { Algorithm } from '../../database/entities/algorithm.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAlgorithm, Algorithm, User])],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}

