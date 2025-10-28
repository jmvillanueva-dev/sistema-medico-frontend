import { defineMiddleware } from "astro:middleware";
import { getDashboardPath, hasPermission } from "@/utils/navigation";

const protectedPaths = ["/admin", "/medical", "/select-module"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Ignorar rutas de API, assets, etc.
  if (pathname.startsWith("/api/") || pathname.includes(".")) {
    return next();
  }

  const token = context.cookies.get("auth-token")?.value;
  const userCookie = context.cookies.get("auth-user")?.value;
  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      console.error("Error parsing user cookie:", e);
      context.cookies.delete("auth-token", { path: "/" });
      context.cookies.delete("auth-user", { path: "/" });
    }
  }

  console.log(
    "Middleware - Path:",
    pathname,
    "User:",
    user ? "Authenticated" : "Not authenticated"
  );

  // --- Lógica de Redirección ---

  // 1. Si el usuario ESTÁ autenticado
  if (token && user) {
    // Si intenta ir al login, redirigir a su dashboard
    if (pathname === "/login") {
      const dashboardPath = getDashboardPath(user.roles);
      console.log("Redirecting from login to:", dashboardPath);
      return context.redirect(dashboardPath, 302);
    }

    // Si intenta acceder a una ruta protegida
    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    if (isProtected) {
      // Verificar si tiene permiso
      if (!hasPermission(user.roles, pathname)) {
        // No tiene permiso, redirigir a su dashboard principal
        const dashboardPath = getDashboardPath(user.roles);
        console.log("No permission, redirecting to:", dashboardPath);
        return context.redirect(dashboardPath, 302);
      }
      // Sí tiene permiso, continuar
      return next();
    }

    // Continuar a cualquier otra ruta pública (como /)
    return next();
  }

  // 2. Si el usuario NO está autenticado
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected) {
    // Si intenta acceder a ruta protegida, redirigir a login
    console.log("Not authenticated, redirecting to login");
    return context.redirect(
      `/login?redirect=${encodeURIComponent(pathname)}`,
      302
    );
  }

  // Continuar a rutas públicas
  return next();
});
