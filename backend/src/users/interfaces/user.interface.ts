import { Role } from '../enums/role.enum';

export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserLogin {
  email: string;
  password: string;
}
