import api from "./interceptor";
import { Employee } from "@/data/mockData";

const getAll = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>(`/users/role/employee`);
  return response.data;
};

export default {
  getAll,
};
