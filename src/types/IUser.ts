export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: "admin" | "user";
  password?: string;
  loggedIn: boolean;
}