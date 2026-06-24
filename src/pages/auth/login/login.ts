import users from "../../../data/users.json";
import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";

import { navigate } from "../../../utils/navigate";

// 1. Selección de elementos del DOM
const form = document.getElementById("loginForm") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;

// 2. Manejador del evento de inicio de sesión
form.addEventListener("submit", (e: Event) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    // Validación básica
    if (!email || !password) {
        errorMessage.textContent = "Debe completar todos los campos";
        return;
    }

    // Búsqueda de usuario (Nota: Esta lógica asume que las contraseñas están en JSON)
    const userFound = users.find(
        (user) => user.mail === email && user.password === password
    );

    if (!userFound) {
        errorMessage.textContent = "Correo o contraseña incorrectos";
        return;
    }

    // Creación de objeto de usuario autenticado
    const userToSave: IUser = {
        ...userFound,
        rol: userFound.rol as Rol,
        loggedIn: true
    };

    // Guardar sesión
    localStorage.setItem("userData", JSON.stringify(userToSave));

    // Redirección basada en el rol
    if (userToSave.rol === "admin") {
        navigate("/src/pages/admin/adminHome/adminHome.html");
    } else {
        navigate("/src/pages/store/home/home.html");
    }
});
