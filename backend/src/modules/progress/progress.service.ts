import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAlgorithm } from '../../database/entities/user-algorithm.entity';
import { Algorithm } from '../../database/entities/algorithm.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserAlgorithm) private readonly userAlgoRepo: Repository<UserAlgorithm>,
    @InjectRepository(Algorithm) private readonly algoRepo: Repository<Algorithm>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getProgress(userId: number) {
    const [learnedCount, total] = await Promise.all([
      this.userAlgoRepo.count({ where: { user: { id: userId }, active: true } }),
      this.algoRepo.count(),
    ]);
    const percent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;
    return { learned: learnedCount, total, percent };
  }

  async getLearnedAlgorithms(userId: number) {
    const relations = await this.userAlgoRepo.find({
      where: { user: { id: userId }, active: true },
      relations: ['algorithm'],
      order: { learnedAt: 'DESC' },
    });
    return { learned: relations.map((r) => r.algorithm) };
  }

  async learn(userId: number, slug: string) {
    const algorithm = await this.algoRepo.findOne({ where: { slug } });
    if (!algorithm) return null;

    const existing = await this.userAlgoRepo.findOne({
      where: { user: { id: userId }, algorithm: { id: algorithm.id } },
      relations: ['user', 'algorithm'],
    });

    const now = new Date();

    if (existing) {
      if (!existing.active) {
        existing.active = true;
        existing.learnedAt = now;
        await this.userAlgoRepo.save(existing);
        return { slug: algorithm.slug, learnedAt: existing.learnedAt, created: false, reactivated: true, alreadyActive: false };
      }
      return { slug: algorithm.slug, learnedAt: existing.learnedAt, created: false, reactivated: false, alreadyActive: true };
    }

    const relation = this.userAlgoRepo.create({ user: { id: userId } as User, algorithm, active: true, learnedAt: now });
    await this.userAlgoRepo.save(relation);
    return { slug: algorithm.slug, learnedAt: relation.learnedAt, created: true, reactivated: false, alreadyActive: false };
  }

  async unlearn(userId: number, slug: string) {
    const algorithm = await this.algoRepo.findOne({ where: { slug } });
    if (!algorithm) return;
    const existing = await this.userAlgoRepo.findOne({ where: { user: { id: userId }, algorithm: { id: algorithm.id } } });
    if (!existing) return;
    if (existing.active) {
      existing.active = false;
      await this.userAlgoRepo.save(existing);
    }
  }
}
