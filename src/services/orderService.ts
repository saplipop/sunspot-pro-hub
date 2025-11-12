import { IOrder } from "@/interfaces/order";
import api from "./interceptor";


export const orderService = {
getAll: async (): Promise<IOrder[]> => {
    const response = await api.get<IOrder[]>("/api/orders");
    return response.data;
  },
};
