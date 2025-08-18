import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserAlgorithm } from './user-algorithm.entity';

export type AlgorithmCategory = 'sorting' | 'search' | 'graph' | 'dp' | 'string' | 'greedy' | 'tree';
export type AlgorithmDifficulty = 'easy' | 'medium' | 'hard';

@Entity('algorithms')
export class Algorithm {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  category: AlgorithmCategory;

  @Column({ type: 'varchar', length: 10 })
  difficulty: AlgorithmDifficulty;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserAlgorithm, (ua) => ua.algorithm)
  learnedBy: UserAlgorithm[];
}
