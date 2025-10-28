/**
 * Determina la ruta de dashboard basada en los roles del usuario.
 */
export const getDashboardPath = (roles: string[]): string => {
  const hasAdmin = roles.includes("ADMINISTRADOR");
  const hasMedical = roles.some((r) => r === "MEDICO" || r === "ENFERMERO");

  if (hasAdmin && hasMedical) {
    return "/select-module";
  }
  if (hasAdmin) {
    return "/admin/dashboard";
  }
  if (hasMedical) {
    return "/medical/dashboard";
  }

  // Caso por defecto si los roles no coinciden
  return "/login?error=no_role";
};

/**
 * Verifica si un usuario tiene permiso para una ruta específica.
 */
export const hasPermission = (roles: string[], pathname: string): boolean => {
  console.log("Checking permission for:", pathname, "Roles:", roles);

  // Rutas públicas - siempre permitidas
  if (pathname === "/" || pathname === "/login") {
    return true;
  }

  // Rutas de admin
  if (pathname.startsWith("/admin")) {
    return roles.includes("ADMINISTRADOR");
  }

  // Rutas médicas
  if (pathname.startsWith("/medical")) {
    return roles.some((r) => r === "MEDICO" || r === "ENFERMERO");
  }

  // Ruta de selección de módulo
  if (pathname === "/select-module") {
    const hasAdmin = roles.includes("ADMINISTRADOR");
    const hasMedical = roles.some((r) => r === "MEDICO" || r === "ENFERMERO");
    // Debe ser accesible si tienes AMBOS roles
    return hasAdmin && hasMedical;
  }

  // Por defecto, denegar acceso a rutas no especificadas
  return false;
};
