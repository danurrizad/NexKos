import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender } from '../enums/gender.enum';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('occupants')
export class Occupant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nik: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  phone: string;

  @Column()
  isPrimary: boolean;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, (room) => room.id)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
