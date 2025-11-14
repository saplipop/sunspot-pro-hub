import { z } from "zod";

export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  consumerNumber: z
    .string()
    .trim()
    .min(5, "Consumer number must be at least 5 characters")
    .max(50, "Consumer number must be less than 50 characters"),
  
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  
  address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
  
  systemCapacity: z
    .number()
    .positive("System capacity must be positive")
    .max(1000, "System capacity must be less than 1000 kW")
    .or(z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error("Invalid capacity");
      return num;
    })),
  
  orderAmount: z
    .number()
    .positive("Order amount must be positive")
    .max(100000000, "Order amount must be less than 10 crores")
    .or(z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error("Invalid amount");
      return num;
    })),
  
  orderDate: z
    .string()
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Please enter a valid date"),
  
  sanctionDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Please enter a valid date"),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;
