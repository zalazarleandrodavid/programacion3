// auth.ts no necesita importar el JSON, el fetch lo hace dinámicamente
import { login } from "../../../utils/auth"; 
import { navigate } from "../../../utils/navigate";

// 1. Selección de elementos del DOM
const form = document.getElementById("loginForm") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;

// 2. Manejador del evento de inicio de sesión (¡Debe ser async!)
form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    // Validación básica
    if (!email || !password) {
        errorMessage.textContent = "Debe completar todos los campos";
        return;
    }

    // Llamamos a la función asíncrona y esperamos el resultado
    const userFound = await login(email, password);

    if (!userFound) {
        errorMessage.textContent = "Correo o contraseña incorrectos";
        return;
    }

    // La lógica de guardado en localStorage ya está dentro de tu función login,
    // así que solo procedemos a la redirección según el rol
    if (userFound.rol === "admin") {
        navigate("/src/pages/admin/adminHome/adminHome.html");
    } else {
        navigate("/src/pages/store/home/home.html");
    }
});