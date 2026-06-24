import { navigate } from "../utils/navigate";
export const checkAuth = () => {
  const userData =
    localStorage.getItem("userData");

  if (!userData) {
    navigate(
      "/src/pages/auth/login/login.html"
    );
    return;
  }

  const user = JSON.parse(userData);

  if (
    window.location.pathname.includes("/admin/") &&
    user.rol !== "admin"
  ) {
    navigate(
      "/src/pages/store/home/home.html"
    );
  }
};