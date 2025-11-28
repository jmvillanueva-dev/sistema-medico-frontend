import { useEffect } from "react";
import { useCatalogStore } from "@/store/catalogStore";

/**
 * Componente invisible que inicializa la carga de catálogos al montarse.
 * Debe incluirse en páginas protegidas (después del login) para precargar
 * los catálogos una sola vez y tenerlos disponibles en caché.
 *
 * Uso: <CatalogInitializer client:load />
 */
export default function CatalogInitializer() {
  const { loadCatalogs, isLoaded, isLoading } = useCatalogStore();

  useEffect(() => {
    // Solo cargar si no están ya cargados y no se está cargando
    if (!isLoaded && !isLoading) {
      loadCatalogs();
    }
  }, [loadCatalogs, isLoaded, isLoading]);

  // Este componente no renderiza nada visible
  return null;
}
