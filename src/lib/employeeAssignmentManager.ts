/**
 * Employee Assignment Manager
 * Centralized system for interconnecting employee assignments across all sections
 */

import { storage } from "./storage";
import { Employee } from "@/data/mockData";

export interface AssignmentPayload {
  customerId: string;
  employeeId: string;
  employeeName: string;
  sections: {
    customer?: boolean;
    wiring?: boolean;
    inspection?: boolean;
    commissioning?: boolean;
    checklist?: boolean;
  };
  dates?: {
    start?: Date;
    end?: Date;
  };
  notes?: string;
}

class EmployeeAssignmentManager {
  /**
   * Assign employee to customer and all related sections
   */
  assignEmployee(payload: AssignmentPayload): void {
    const { customerId, employeeId, employeeName, sections, dates, notes } = payload;

    // 1. Update Customer Assignment
    if (sections.customer !== false) {
      const customer = storage.getCustomer(customerId);
      if (customer) {
        storage.updateCustomer({
          ...customer,
          assignedTo: employeeId,
        });
      }
    }

    // 2. Update Employee's Assigned Customers
    const employees = storage.getEmployees();
    const employee = employees.find(e => e.id === employeeId);
    if (employee && !employee.assignedCustomers.includes(customerId)) {
      const updatedEmployee: Employee = {
        ...employee,
        assignedCustomers: [...employee.assignedCustomers, customerId],
      };
      storage.updateEmployee(updatedEmployee);
    }

    // 3. Update Wiring Section
    if (sections.wiring !== false) {
      let wiring = storage.getCustomerWiring(customerId);
      if (!wiring) {
        wiring = {
          customerId,
          status: "in_progress",
        };
      }
      storage.updateWiring(customerId, {
        ...wiring,
        technicianId: employeeId,
        technicianName: employeeName,
        startDate: dates?.start?.toISOString(),
        endDate: dates?.end?.toISOString(),
        remark: notes,
        status: "in_progress",
      });
    }

    // 4. Update Checklist Items
    if (sections.checklist !== false) {
      const checklistItems = storage.getCustomerChecklist(customerId);
      checklistItems.forEach((item) => {
        if (item.status === "pending" || !item.assignedEmployeeId) {
          storage.updateChecklistItem({
            ...item,
            assignedEmployeeId: employeeId,
            assignedEmployeeName: employeeName,
            status: item.status === "pending" ? "in_progress" : item.status,
            startDate: dates?.start?.toISOString(),
            endDate: dates?.end?.toISOString(),
          });
        }
      });
    }

    // 5. Update Inspection Section
    if (sections.inspection !== false) {
      const inspections = storage.getCustomerInspections(customerId);
      inspections.forEach((inspection) => {
        if (inspection.status === "pending" || !inspection.qcName) {
          storage.updateInspection({
            ...inspection,
            qcName: employeeName,
            status: "in_progress",
            startDate: dates?.start?.toISOString(),
            endDate: dates?.end?.toISOString(),
            remark: notes,
          });
        }
      });
    }

    // 6. Update Commissioning Section
    if (sections.commissioning !== false) {
      let commissioning = storage.getCustomerCommissioning(customerId);
      if (!commissioning) {
        commissioning = {
          customerId,
          status: "pending",
        };
      }
      storage.updateCommissioning(customerId, {
        ...commissioning,
        status: "in_progress",
        startDate: dates?.start?.toISOString(),
        endDate: dates?.end?.toISOString(),
        remark: notes,
      });
    }

    // 7. Log Activity
    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: employeeName,
      userId: employeeId,
      customerId,
      section: "Employee Assignment",
      action: `Assigned ${employeeName} to multiple sections`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Unassign employee from customer and all related sections
   */
  unassignEmployee(customerId: string, employeeId: string): void {
    // 1. Update Customer
    const customer = storage.getCustomer(customerId);
    if (customer?.assignedTo === employeeId) {
      storage.updateCustomer({
        ...customer,
        assignedTo: undefined,
      });
    }

    // 2. Update Employee's Assigned Customers
    const employees = storage.getEmployees();
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const updatedEmployee: Employee = {
        ...employee,
        assignedCustomers: employee.assignedCustomers.filter((id) => id !== customerId),
      };
      storage.updateEmployee(updatedEmployee);
    }

    // 3. Clear Wiring Assignment
    const wiring = storage.getCustomerWiring(customerId);
    if (wiring?.technicianId === employeeId) {
      storage.updateWiring(customerId, {
        ...wiring,
        technicianId: undefined,
        technicianName: undefined,
        status: "pending",
      });
    }

    // 4. Clear Checklist Assignments
    const checklistItems = storage.getCustomerChecklist(customerId);
    checklistItems.forEach((item) => {
      if (item.assignedEmployeeId === employeeId) {
        storage.updateChecklistItem({
          ...item,
          assignedEmployeeId: undefined,
          assignedEmployeeName: undefined,
          status: "pending",
        });
      }
    });

    // 5. Clear Inspection Assignments
    const inspections = storage.getCustomerInspections(customerId);
    inspections.forEach((inspection) => {
      if (inspection.qcName === employee?.name) {
        storage.updateInspection({
          ...inspection,
          qcName: undefined,
          status: "pending",
        });
      }
    });

    // 6. Log Activity
    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: "System",
      userId: "system",
      customerId,
      section: "Employee Assignment",
      action: `Unassigned employee from all sections`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Reassign employee (unassign old, assign new)
   */
  reassignEmployee(
    customerId: string,
    oldEmployeeId: string,
    newPayload: AssignmentPayload
  ): void {
    this.unassignEmployee(customerId, oldEmployeeId);
    this.assignEmployee(newPayload);
  }

  /**
   * Get all assignments for an employee
   */
  getEmployeeAssignments(employeeId: string): {
    customers: string[];
    totalProjects: number;
  } {
    const employees = storage.getEmployees();
    const employee = employees.find(e => e.id === employeeId);
    return {
      customers: employee?.assignedCustomers || [],
      totalProjects: employee?.assignedCustomers.length || 0,
    };
  }

  /**
   * Get assignment status for a customer
   */
  getCustomerAssignmentStatus(customerId: string): {
    hasCustomerAssignment: boolean;
    hasWiringAssignment: boolean;
    hasInspectionAssignment: boolean;
    hasCommissioningAssignment: boolean;
    hasChecklistAssignment: boolean;
    assignedEmployee?: string;
  } {
    const customer = storage.getCustomer(customerId);
    const wiring = storage.getCustomerWiring(customerId);
    const inspections = storage.getCustomerInspections(customerId);
    const checklist = storage.getCustomerChecklist(customerId);
    const commissioning = storage.getCustomerCommissioning(customerId);

    return {
      hasCustomerAssignment: !!customer?.assignedTo,
      hasWiringAssignment: !!wiring?.technicianId,
      hasInspectionAssignment: inspections.some((i) => !!i.qcName),
      hasCommissioningAssignment: commissioning?.status !== "pending",
      hasChecklistAssignment: checklist.some((c) => !!c.assignedEmployeeId),
      assignedEmployee: customer?.assignedTo,
    };
  }
}

export const employeeAssignmentManager = new EmployeeAssignmentManager();
