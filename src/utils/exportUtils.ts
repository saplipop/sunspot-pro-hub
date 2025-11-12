import * as XLSX from "xlsx";
import { Customer } from "@/data/mockData";

export const exportToExcel = (customers: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    customers.map((c) => ({
      Name: c.name,
      "Consumer Number": c.consumerNumber,
      Mobile: c.mobile,
      Address: c.address,
      "System Capacity (kW)": c.systemCapacity,
      "Order Amount": c.orderAmount,
      "Order Date": c.orderDate,
      "Progress (%)": c.progress || 0,
      Status: c.approvalStatus,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

  XLSX.writeFile(workbook, `Customers_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const exportCustomerReport = (customer: Customer) => {
  const reportData = `
SOLAR PROJECT TRACKING SYSTEM
Customer Report
Generated: ${new Date().toLocaleString()}

=================================
CUSTOMER INFORMATION
=================================
Name: ${customer.name}
Consumer Number: ${customer.consumerNumber}
Mobile: ${customer.mobile}
Address: ${customer.address}
System Capacity: ${customer.systemCapacity} kW
Order Amount: ₹${customer.orderAmount.toLocaleString()}
Order Date: ${new Date(customer.orderDate).toLocaleDateString()}

=================================
`;

  const blob = new Blob([reportData], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${customer.name.replace(/\s+/g, "_")}_report.txt`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
