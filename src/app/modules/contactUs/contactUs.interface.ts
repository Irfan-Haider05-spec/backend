export interface IContactUs {
  name: string;
  email: string;
  subject: string;
  message?: string; // optional
  createdAt?: Date;
  updatedAt?: Date;
}
