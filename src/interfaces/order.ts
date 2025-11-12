import { OrderStatus } from "@/constants/enums";

export interface IOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  consumerNumber: string;
  systemCapacity: number;
  address: string;
  orderAmount: number;
  orderDate: Date;
  totalAmount: number;
  status: OrderStatus;
  progress: number;
  isDeleted: boolean;
}