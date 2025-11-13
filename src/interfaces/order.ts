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
  assignedTo? : IdNameDto;
  isDeleted: boolean;
}

export interface IdNameDto {
  id: string;
  name: string;
}

export interface AssignOrderDto {
  orderIds: number[];
  employeeId: string;
  removeUnassigned?: boolean;
}