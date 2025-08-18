import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Algorithm } from './algorithm.entity';

@Entity('user_algorithms')
@Unique(['user', 'algorithm'])
export class UserAlgorithm {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.learnedRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Algorithm, (algorithm) => algorithm.learnedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'algorithm_id' })
  @Index()
  algorithm: Algorithm;

  @CreateDateColumn({ name: 'learned_at' })
  learnedAt: Date;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;
}

