// auth.ts

export interface UserSession {
  id: number;
  nombre: string;
  mail: string;
  rol: "admin" | "user";
}

// Cambiamos la función a 'async' y devuelve una Promesa
export const login = async (
  email: string,
  password: string
): Promise<UserSession | null> => {
  try {
    // 1. Hacemos el fetch al archivo en la carpeta public
    const response = await fetch('/data/users.json');
    
    if (!response.ok) {
        throw new Error("No se pudo conectar con el servidor de usuarios");
    }

    const users = await response.json();

    // 2. Buscamos el usuario
    const found = users.find(
      (u: any) => u.mail === email && u.password === password
    );

    if (!found) return null;

    const sessionData: UserSession = {
      id: found.id,
      nombre: found.nombre,
      mail: found.mail,
      rol: found.rol as "admin" | "user",
    };

    localStorage.setItem("userData", JSON.stringify(sessionData));

    return sessionData;
  } catch (error) {
    console.error("Error en el login:", error);
    return null;
  }
};

// logout y getSession pueden seguir siendo síncronos
export const logout = () => {
  localStorage.removeItem("userData");
  window.location.href = "/src/pages/auth/login/login.html";
};

export const getSession = (): UserSession | null => {
  const session = localStorage.getItem("userData");
  return session ? JSON.parse(session) : null;
};

export const protectRoute = (requiredRole?: "admin" | "user") => {
  const session = getSession();

  if (!session) {
    window.location.href = "/src/pages/auth/login/login.html";
    return;
  }

  if (requiredRole && session.rol !== requiredRole) {
    window.location.href = "/src/pages/store/home/home.html";
  }
};