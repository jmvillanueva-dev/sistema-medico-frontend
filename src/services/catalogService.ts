import api from "./api";
import type { GroupedCatalogsResponse } from "../types/catalog";

/**
 * Obtiene todos los catálogos agrupados del sistema en una sola petición.
 * Este endpoint es ideal para cargar todos los catálogos al inicio de la aplicación
 * y mantenerlos en caché.
 */
export const getGroupedCatalogs = () => {
  return api.get<GroupedCatalogsResponse>("/catalogos/agrupados");
};
