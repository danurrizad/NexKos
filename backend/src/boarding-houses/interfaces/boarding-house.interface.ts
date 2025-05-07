export interface IBoardingHouse {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  ownerId: number;
  facilities?: string[];
  createdAt: Date;
  updatedAt: Date;
}
