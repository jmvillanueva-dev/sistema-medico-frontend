import { create } from "zustand";
import { getEmployeeById } from "@/services/api";

// --- Interfaces ---

export interface EmployeeData {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  especialidad: string;
  codigoProfesional: string;
  telefono: string;
  estaActivo: boolean;
  fechaCreacion: string | null;
}

interface UserProfileState {
  employeeData: EmployeeData | null;
  loading: boolean;
  error: string | null;
  fetchEmployeeData: (employeeId: string) => Promise<void>;
  setEmployeeData: (data: EmployeeData) => void;
}

// --- Store ---

export const useUserProfileStore = create<UserProfileState>((set) => ({
  employeeData: null,
  loading: false,
  error: null,

  /**
   * Busca y guarda los datos del perfil del empleado.
   */
  fetchEmployeeData: async (employeeId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getEmployeeById(employeeId);
      set({ employeeData: response.data, loading: false });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "No se pudieron cargar los datos del perfil.";
      set({ error: errorMsg, loading: false });
    }
  },
    /**
     * Actualiza directamente los datos del empleado en el store.
     */
    setEmployeeData: (data: EmployeeData) => {
        set({ employeeData: data });
    }
}));
