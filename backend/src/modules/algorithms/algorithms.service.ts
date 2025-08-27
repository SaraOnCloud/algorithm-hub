import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Algorithm, AlgorithmCategory } from '../../database/entities/algorithm.entity';

export interface ListAlgorithmsParams {
  search?: string;
  category?: AlgorithmCategory;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AlgorithmsService {
  constructor(
    @InjectRepository(Algorithm) private readonly repo: Repository<Algorithm>,
  ) {}

  async findAll(params: ListAlgorithmsParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize || 20));

    const where: FindOptionsWhere<Algorithm>[] = [];
    const filters: FindOptionsWhere<Algorithm> = {} as any;

    if (params.category) {
      filters.category = params.category;
    }

    if (params.search) {
      const q = `%${params.search}%`;
      // MariaDB/MySQL are usually case-insensitive due to collation, so using Like is sufficient
      where.push({ ...filters, name: Like(q) });
      where.push({ ...filters, slug: Like(q) });
      where.push({ ...filters, description: Like(q) });
    } else {
      where.push(filters);
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { items, page, pageSize, total };
  }

  async findBySlugOrFail(slug: string) {
    const algo = await this.repo.findOne({ where: { slug } });
     throw new NotFoundException('Algorithm not found');
    return algo;
  }
}
