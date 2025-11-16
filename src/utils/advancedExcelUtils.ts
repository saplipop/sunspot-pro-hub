/**
 * Advanced Excel Export/Import with Full Field Coverage
 * Exports to multiple sheets: Customers, Employees, Tasks, Documents, ActivityLog
 */

import * as XLSX from "xlsx";
import {
  Customer,
  Employee,
  Task,
  Document,
  ActivityLog,
  WiringDetails,
  ChecklistItem,
  Inspection,
  Commissioning,
} from "@/data/mockData";
import { storage } from "@/lib/storage";

export interface ExportSummary {
  customers: number;
  employees: number;
  tasks: number;
  documents: number;
  activities: number;
}

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * Export all data to Excel with multiple sheets
 */
export const exportFullDataToExcel = (): ExportSummary => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Customers with full details
  const customers = storage.getCustomers();
  const customerData = customers.map((c) => {
    const wiring = storage.getCustomerWiring(c.id);
    const tasks = storage.getCustomerTasks(c.id);
    const documents = storage.getCustomerDocuments(c.id);
    const checklist = storage.getCustomerChecklist(c.id);

    return {
      "Customer ID": c.id,
      "Name": c.name,
      "Consumer Number": c.consumerNumber,
      "Mobile": c.mobile,
      "Address": c.address,
      "System Capacity (kW)": c.systemCapacity,
      "Order Amount": c.orderAmount,
      "Order Date": c.orderDate,
      "Assigned To": c.assignedTo || "",
      "Approval Status": c.approvalStatus,
      "Locked": c.locked ? "Yes" : "No",
      "Active Tasks": tasks.filter((t) => t.status !== "completed").length,
      "Completed Tasks": tasks.filter((t) => t.status === "completed").length,
      "Documents Uploaded": documents.filter((d) => d.uploaded).length,
      "Total Documents": documents.length,
      "Checklist Progress": `${checklist.filter((i) => i.status === "completed").length}/${checklist.length}`,
      "Wiring Status": wiring?.status || "N/A",
      "Wiring Technician": wiring?.technicianName || "N/A",
    };
  });

  const wsCustomers = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");

  // Sheet 2: Employees
  const employees = storage.getEmployees();
  const employeeData = employees.map((e) => ({
    "Employee ID": e.id,
    "Name": e.name,
    "Email": e.email,
    "Phone": e.phone,
    "Status": e.status,
    "Assigned Projects": e.assignedCustomers.length,
    "Customer IDs": e.assignedCustomers.join(", "),
    "Created By": e.createdBy,
    "Created Date": e.createdDate,
    "Suspended At": e.suspendedAt || "",
    "Suspended By": e.suspendedBy || "",
    "Suspension Reason": e.suspensionReason || "",
  }));

  const wsEmployees = XLSX.utils.json_to_sheet(employeeData);
  XLSX.utils.book_append_sheet(wb, wsEmployees, "Employees");

  // Sheet 3: Tasks/Wiring
  const allTasks = storage.getTasks();
  const taskData = allTasks.map((t) => {
    const customer = storage.getCustomer(t.customerId);
    const employee = employees.find((e) => e.id === t.assignedTo);
    const wiring = storage.getCustomerWiring(t.customerId);

    return {
      "Task ID": t.id,
      "Customer Name": customer?.name || "",
      "Customer ID": t.customerId,
      "Title": t.title,
      "Description": t.description,
      "Assigned To": employee?.name || "",
      "Employee ID": t.assignedTo,
      "Role": t.role || "",
      "Priority": t.priority,
      "Status": t.status,
      "Start Date": t.startDate,
      "End Date": t.endDate,
      "Created By": t.createdBy,
      "Created Date": t.createdDate,
      "Wiring Linked": t.role === "technician" && wiring ? "Yes" : "No",
      "Wiring Status": wiring?.status || "N/A",
    };
  });

  const wsTasks = XLSX.utils.json_to_sheet(taskData);
  XLSX.utils.book_append_sheet(wb, wsTasks, "Tasks");

  // Sheet 4: Documents
  const allDocuments = storage.getDocuments();
  const documentData = allDocuments.map((d) => {
    const customer = storage.getCustomer(d.customerId);
    
    return {
      "Document ID": d.id,
      "Customer Name": customer?.name || "",
      "Customer ID": d.customerId,
      "Document Name": d.name,
      "Document Number": d.documentNumber || "",
      "Uploaded": d.uploaded ? "Yes" : "No",
      "Upload Date": d.uploadDate || "",
      "Status": d.status,
      "Verified": d.verified ? "Yes" : "No",
      "Verified By": d.verifiedBy || "",
      "Done By": d.doneBy || "",
      "Submitted To": d.submittedTo || "",
      "Start Date": d.startDate || "",
      "End Date": d.endDate || "",
      "Notes": d.notes || "",
      "Remark": d.remark || "",
      "File ID": d.fileId || "",
    };
  });

  const wsDocuments = XLSX.utils.json_to_sheet(documentData);
  XLSX.utils.book_append_sheet(wb, wsDocuments, "Documents");

  // Sheet 5: Activity Log
  const activities = storage.getActivities().slice(0, 1000); // Last 1000 activities
  const activityData = activities.map((a) => {
    const customer = storage.getCustomer(a.customerId);
    
    return {
      "Activity ID": a.id,
      "Date": a.date,
      "User": a.user,
      "User ID": a.userId,
      "Customer Name": customer?.name || "",
      "Customer ID": a.customerId,
      "Section": a.section,
      "Action": a.action,
    };
  });

  const wsActivities = XLSX.utils.json_to_sheet(activityData);
  XLSX.utils.book_append_sheet(wb, wsActivities, "Activity Log");

  // Write file
  const fileName = `SolarFlow_FullExport_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return {
    customers: customerData.length,
    employees: employeeData.length,
    tasks: taskData.length,
    documents: documentData.length,
    activities: activityData.length,
  };
};

/**
 * Import data from Excel
 */
export const importFullDataFromExcel = async (
  file: File
): Promise<ImportSummary> => {
  const summary: ImportSummary = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    // Import Customers
    if (workbook.SheetNames.includes("Customers")) {
      const customerSheet = workbook.Sheets["Customers"];
      const customerData = XLSX.utils.sheet_to_json(customerSheet);

      customerData.forEach((row: any, index: number) => {
        try {
          const consumerNumber = row["Consumer Number"];
          const existing = storage
            .getCustomers()
            .find((c) => c.consumerNumber === consumerNumber);

          const customerObj: Customer = {
            id: existing?.id || `CUST${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: row["Name"],
            consumerNumber,
            mobile: row["Mobile"] || "",
            address: row["Address"] || "",
            systemCapacity: parseFloat(row["System Capacity (kW)"] || "0"),
            orderAmount: parseFloat(row["Order Amount"] || "0"),
            orderDate: row["Order Date"] || new Date().toISOString().split("T")[0],
            assignedTo: row["Assigned To"] || undefined,
            approvalStatus: row["Approval Status"] || "pending",
            locked: row["Locked"] === "Yes",
          };

          if (existing) {
            storage.updateCustomer(customerObj);
            summary.updated++;
          } else {
            storage.addCustomer(customerObj);
            summary.created++;
          }
        } catch (error) {
          summary.errors.push({
            row: index + 2,
            error: `Customer import error: ${error}`,
          });
        }
      });
    }

    // Import Employees
    if (workbook.SheetNames.includes("Employees")) {
      const employeeSheet = workbook.Sheets["Employees"];
      const employeeData = XLSX.utils.sheet_to_json(employeeSheet);

      employeeData.forEach((row: any, index: number) => {
        try {
          const email = row["Email"];
          const existing = storage
            .getEmployees()
            .find((e) => e.email === email);

          const employeeObj: Employee = {
            id: existing?.id || `EMP${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: row["Name"],
            email,
            phone: row["Phone"] || "",
            status: row["Status"] || "pending",
            assignedCustomers: row["Customer IDs"]
              ? row["Customer IDs"].split(",").map((id: string) => id.trim())
              : [],
            createdBy: row["Created By"] || "Admin",
            createdDate:
              row["Created Date"] || new Date().toISOString(),
          };

          if (existing) {
            storage.updateEmployee(employeeObj);
            summary.updated++;
          } else {
            storage.addEmployee(employeeObj);
            summary.created++;
          }
        } catch (error) {
          summary.errors.push({
            row: index + 2,
            error: `Employee import error: ${error}`,
          });
        }
      });
    }

    // Import Tasks
    if (workbook.SheetNames.includes("Tasks")) {
      const taskSheet = workbook.Sheets["Tasks"];
      const taskData = XLSX.utils.sheet_to_json(taskSheet);

      taskData.forEach((row: any, index: number) => {
        try {
          const taskId = row["Task ID"];
          const existing = storage.getTasks().find((t) => t.id === taskId);

          const taskObj: Task = {
            id: taskId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customerId: row["Customer ID"],
            assignedTo: row["Employee ID"],
            title: row["Title"],
            description: row["Description"] || "",
            startDate: row["Start Date"],
            endDate: row["End Date"],
            priority: row["Priority"] || "medium",
            status: row["Status"] || "pending",
            role: row["Role"] as any,
            createdBy: row["Created By"] || "Admin",
            createdDate: row["Created Date"] || new Date().toISOString(),
          };

          if (existing) {
            storage.updateTask(taskObj);
            summary.updated++;
          } else {
            storage.addTask(taskObj);
            summary.created++;
          }
        } catch (error) {
          summary.errors.push({
            row: index + 2,
            error: `Task import error: ${error}`,
          });
        }
      });
    }

  } catch (error) {
    summary.errors.push({
      row: 0,
      error: `File parsing error: ${error}`,
    });
  }

  return summary;
};
