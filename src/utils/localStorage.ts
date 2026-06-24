import type { IUser } from "../types/IUser";
import { navigate } from "../utils/navigate";
const SESSION_KEY = "userData";

export const saveUser = (user: IUser) => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user)
  );
};

export const getUser = (): IUser | null => {

  const user =
    localStorage.getItem(SESSION_KEY);

  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

const userData = localStorage.getItem("userData");

if (userData) {
  const user = JSON.parse(userData);
  console.log(user.nombre);
}



export const logout = () => {
  localStorage.removeItem("userData");

  navigate(
    "/src/pages/auth/login/login.html"
  );
};