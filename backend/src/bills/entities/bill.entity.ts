import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Occupant } from '../../occupants/entities/occupant.entity';
import { BillStatus } from '../enums/bill-status.enum';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  billNumber: string;

  @Column()
  billingPeriod: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: BillStatus,
    enumName: 'bill_status_enum',
    default: BillStatus.Belum_Dibayar,
  })
  status: BillStatus;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => Occupant, (occupant) => occupant.id)
  occupant: Occupant;

  @ManyToOne(() => Room, (room) => room.id)
  room: Room;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  createdBy: User;

  @OneToMany(() => Payment, (payment) => payment.bill)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column({ default: false })
  isDeleted: boolean;
}
