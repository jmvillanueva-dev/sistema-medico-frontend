/**
 * Representa un item individual de un catálogo
 */
export interface CatalogItem {
  id: string;
  catalogoId: string;
  catalogoNombre: string;
  nombre: string;
  codigo: string | null;
  valor: string | null;
}

/**
 * Nombres de los catálogos disponibles en el sistema
 */
export type CatalogName =
  | "GENERO"
  | "ESTADO_CIVIL"
  | "GRUPO_SANGUINEO"
  | "GRUPO_CULTURAL"
  | "NIVEL_INSTRUCCION"
  | "PROVINCIAS"
  | "OCUPACIONES"
  | "FUENTE_INFORMACION"
  | "PARENTESCO"
  | "TIPO_ANTECEDENTE"
  | "LISTADO_PATOLOGIAS";

/**
 * Estructura de los catálogos agrupados que retorna el API
 */
export type GroupedCatalogs = {
  [key in CatalogName]?: CatalogItem[];
};

/**
 * Respuesta del endpoint de catálogos agrupados
 */
export interface GroupedCatalogsResponse {
  success: boolean;
  message: string;
  data: GroupedCatalogs;
  timestamp: string;
  path: string | null;
}
