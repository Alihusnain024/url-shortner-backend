import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity/user.entity';

@Entity()
export class URL {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column()
  shortUrl: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ default: 0 })
  clickCount: number;

  @ManyToOne(() => User, user => user.urls)
  user: User;
}
