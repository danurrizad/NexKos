import { PaymentMethod } from '../enums/payment-method.enum';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Bill } from 'src/bills/entities/bill.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionReference: string;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ nullable: true })
  paymentProof: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_method_enum',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status_enum',
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  gatewayName: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => User, (user) => user.id)
  verifiedBy: User;

  @ManyToOne(() => Bill, (bill) => bill.id)
  bill: Bill;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column({ default: false })
  isDeleted: boolean;
}
