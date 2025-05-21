import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from '../enums/payment-method.enum';
import { Occupant } from '../../occupants/entities/occupant.entity';
import { BillStatus } from '../enums/bill-status.enum';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionNumber: string;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: BillStatus,
    enumName: 'bill_status_enum',
    default: BillStatus.Belum_Dibayar,
  })
  status: BillStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_method_enum',
  })
  paymentMethod: PaymentMethod;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  issueDate: Date;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Occupant, (occupant) => occupant.id)
  occupant: Occupant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
