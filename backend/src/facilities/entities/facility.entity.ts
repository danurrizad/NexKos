import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { FacilityIcon } from '../enum/facility.icon.enum';

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FacilityIcon,
    enumName: 'facility_icon_enum',
    nullable: true,
  })
  icon: FacilityIcon;

  @ManyToMany(() => Room, (room) => room.id, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'room_facilities' })
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
