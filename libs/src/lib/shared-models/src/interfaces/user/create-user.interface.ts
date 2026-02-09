export interface ICreateUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  buildingId?: string;

  licensePlate: string;
  description: string;
}
