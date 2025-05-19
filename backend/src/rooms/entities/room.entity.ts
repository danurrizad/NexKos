import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Facility } from 'src/facilities/entities/facility.entity';
import { Occupant } from 'src/occupants/entities/occupant.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomNumber: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.KOSONG,
  })
  status: Status;

  @Column({
    default: 1,
  })
  floor: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
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

  @OneToMany(() => Occupant, (occupant) => occupant.room)
  occupants: Occupant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
