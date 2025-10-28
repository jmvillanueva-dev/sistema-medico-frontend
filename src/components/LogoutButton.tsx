import React from "react";
import { useAuthStore } from "@/store/authStore";

const LogoutButton: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <button onClick={logout} className="btn btn-secondary nav-login-btn">
      Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
