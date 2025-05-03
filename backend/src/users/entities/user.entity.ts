import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from '../enums/gender.enum';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({ nullable: true })
  refreshToken: string;
}
