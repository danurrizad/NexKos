import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Facility } from 'src/facilities/entities/facility.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomNumber: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.AVAILABLE,
  })
  status: Status;

  @Column()
  price: number;

  @Column()
  capacity: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => BoardingHouse, (boardingHouse) => boardingHouse.id)
  @JoinColumn({ name: 'boarding_house_id' })
  boardingHouse: BoardingHouse;

  @ManyToMany(() => Facility, (facility) => facility.id)
  @JoinTable({ name: 'room_facilities' })
  facilities: Facility[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
