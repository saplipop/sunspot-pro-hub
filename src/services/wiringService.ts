import api from "./interceptor";
import { WiringDetails } from "@/data/mockData";

export interface WiringResponse {
  success: boolean;
  data: {
    wiring?: WiringDetails;
  };
  message?: string;
}

const wiringService = {
  getCustomerWiring: async (customerId: string): Promise<WiringDetails | null> => {
    const response = await api.get<WiringResponse>(`/customers/${customerId}/wiring`);
    return response.data.data.wiring || null;
  },

  update: async (customerId: string, data: Partial<WiringDetails>): Promise<WiringDetails> => {
    const response = await api.put<WiringResponse>(`/customers/${customerId}/wiring`, data);
    return response.data.data.wiring!;
  },
};

export default wiringService;
