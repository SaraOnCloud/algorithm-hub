import { Controller, Get, Param, Query } from '@nestjs/common';
import { AlgorithmsService } from './algorithms.service';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AlgorithmCategory } from '../../database/entities/algorithm.entity';

class ListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['sorting', 'search', 'graph', 'dp', 'string', 'greedy', 'tree'])
  category?: AlgorithmCategory;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

@Controller('algorithms')
export class AlgorithmsController {
  constructor(private readonly service: AlgorithmsService) {}

  @Get()
  async list(@Query() query: ListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':slug')
  async getOne(@Param('slug') slug: string) {
    return this.service.findBySlugOrFail(slug);
  }
}
