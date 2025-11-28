import { create } from "zustand";
import { getGroupedCatalogs } from "@/services/catalogService";
import type {
  CatalogItem,
  CatalogName,
  GroupedCatalogs,
} from "@/types/catalog";

interface CatalogState {
  /** Catálogos agrupados cargados del API */
  catalogs: GroupedCatalogs;
  /** Indica si los catálogos están siendo cargados */
  isLoading: boolean;
  /** Indica si los catálogos ya fueron cargados al menos una vez */
  isLoaded: boolean;
  /** Error ocurrido durante la carga */
  error: string | null;
  /** Timestamp de la última carga (para control de caché) */
  lastFetched: number | null;

  /**
   * Carga todos los catálogos del API.
   * Solo hace la petición si no se han cargado o si se fuerza la recarga.
   * @param force - Si es true, recarga aunque ya estén en caché
   */
  loadCatalogs: (force?: boolean) => Promise<void>;

  /**
   * Obtiene los items de un catálogo específico.
   * @param catalogName - Nombre del catálogo a obtener
   * @returns Array de items del catálogo o array vacío si no existe
   */
  getCatalog: (catalogName: CatalogName) => CatalogItem[];

  /**
   * Limpia los catálogos del store (útil al cerrar sesión)
   */
  clearCatalogs: () => void;
}

/** Tiempo de vida del caché en milisegundos (30 minutos) */
const CACHE_TTL_MS = 30 * 60 * 1000;

export const useCatalogStore = create<CatalogState>((set, get) => ({
  catalogs: {},
  isLoading: false,
  isLoaded: false,
  error: null,
  lastFetched: null,

  loadCatalogs: async (force = false) => {
    const state = get();

    // Verificar si ya está cargando para evitar peticiones duplicadas
    if (state.isLoading) {
      return;
    }

    // Verificar caché: si ya está cargado y no ha expirado, no recargar
    if (!force && state.isLoaded && state.lastFetched) {
      const cacheAge = Date.now() - state.lastFetched;
      if (cacheAge < CACHE_TTL_MS) {
        return;
      }
    }

    set({ isLoading: true, error: null });

    try {
      const response = await getGroupedCatalogs();

      if (response.data.success) {
        set({
          catalogs: response.data.data,
          isLoading: false,
          isLoaded: true,
          error: null,
          lastFetched: Date.now(),
        });
      } else {
        set({
          isLoading: false,
          error: response.data.message || "Error al cargar catálogos",
        });
      }
    } catch (error: any) {
      console.error("Error loading catalogs:", error);
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Error de conexión al cargar catálogos",
      });
    }
  },

  getCatalog: (catalogName: CatalogName) => {
    const { catalogs } = get();
    return catalogs[catalogName] || [];
  },

  clearCatalogs: () => {
    set({
      catalogs: {},
      isLoading: false,
      isLoaded: false,
      error: null,
      lastFetched: null,
    });
  },
}));

/**
 * Hook auxiliar para obtener un catálogo específico de forma reactiva
 */
export const useCatalog = (catalogName: CatalogName): CatalogItem[] => {
  return useCatalogStore((state) => state.catalogs[catalogName] || []);
};

/**
 * Hook auxiliar para verificar el estado de carga de los catálogos
 */
export const useCatalogStatus = () => {
  return useCatalogStore((state) => ({
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    error: state.error,
  }));
};
