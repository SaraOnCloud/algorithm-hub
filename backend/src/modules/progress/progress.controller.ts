import { Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('me/progress')
  async getProgress(@CurrentUser('sub') userId: number) {
    return this.service.getProgress(userId);
  }

  @Get('me/algorithms')
  async getLearned(@CurrentUser('sub') userId: number) {
    return this.service.getLearnedAlgorithms(userId);
  }

  @Post('me/algorithms/:slug/learn')
  async learn(@Param('slug') slug: string, @CurrentUser('sub') userId: number, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.learn(userId, slug);
    if (!result) throw new NotFoundException('Algoritmo no encontrado');
    if (result.created || result.reactivated) {
      res.status(HttpStatus.CREATED);
    } else if (result.alreadyActive) {
      // Elegimos 200 OK para el caso idempotente
      res.status(HttpStatus.OK);
    }
    return { slug: result.slug, learnedAt: result.learnedAt };
  }

  @Delete('me/algorithms/:slug/learn')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlearn(@Param('slug') slug: string, @CurrentUser('sub') userId: number) {
    await this.service.unlearn(userId, slug);
  }
}
