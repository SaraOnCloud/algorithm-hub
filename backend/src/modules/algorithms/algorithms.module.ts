import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Algorithm } from '../../database/entities/algorithm.entity';
import { AlgorithmsService } from './algorithms.service';
import { AlgorithmsController } from './algorithms.controller';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SEED_ALGORITHMS } from '../../database/seeds/algorithms.seed';

class AlgorithmsSeeder implements OnModuleInit {
  constructor(@InjectRepository(Algorithm) private readonly repo: Repository<Algorithm>) {}
  async onModuleInit() {
    const existing = await this.repo.find({ select: ['slug'] });
    const existingSlugs = new Set(existing.map((a) => a.slug));
    const toInsert = SEED_ALGORITHMS.filter((s) => !existingSlugs.has(s.slug));
    if (toInsert.length) {
      await this.repo.insert(toInsert);
    }
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Algorithm])],
  controllers: [AlgorithmsController],
  providers: [AlgorithmsService, AlgorithmsSeeder],
  exports: [AlgorithmsService],
})
export class AlgorithmsModule {}

