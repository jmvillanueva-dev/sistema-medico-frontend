import api from "./api";
import type { ApiResponse } from "../types/api";
import type { CatalogItem } from "../types/patient";

export const getCatalogItems = (catalogName: string) => {
  return api.get<ApiResponse<CatalogItem[]>>(`/catalogos/${catalogName}/items`);
};
