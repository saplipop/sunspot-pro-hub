import { IdNameDto } from "@/interfaces/order";
import api from "./interceptor";

export const userService = {
  getUsersByRole: async (role: string): Promise<IdNameDto[]> => {
    const response = await api.get<IdNameDto[]>(`/users/role/${role}`);
    return response.data;
  }
}