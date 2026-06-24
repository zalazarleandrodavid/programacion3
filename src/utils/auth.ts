import users from "../data/users.json";

export interface UserSession {
  id: number;
  nombre: string;
  mail: string;
  rol: "admin" | "user";
}

export const login = (
  email: string,
  password: string
): UserSession | null => {

  const found = users.find(
    (u) => u.mail === email && u.password === password
  );

  if (!found) return null;

  const sessionData: UserSession = {
    id: found.id,
    nombre: found.nombre,
    mail: found.mail,
    rol: found.rol as "admin" | "user"
  };

  localStorage.setItem(
    "userData",
    JSON.stringify(sessionData)
  );

  return sessionData;
};

export const logout = () => {
  localStorage.removeItem("userData");

  window.location.href =
    "/src/pages/auth/login/login.html";
};

export const getSession = (): UserSession | null => {
  const session = localStorage.getItem("userData");

  return session ? JSON.parse(session) : null;
};

export const protectRoute = (
  requiredRole?: "admin" | "user"
) => {

  const session = getSession();

  if (!session) {
    window.location.href =
      "/src/pages/auth/login/login.html";
    return;
  }

  if (
    requiredRole &&
    session.rol !== requiredRole
  ) {
    window.location.href =
      "/src/pages/store/home/home.html";
  }
};