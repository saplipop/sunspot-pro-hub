/**
 * Data Manager - Core Logic Handler
 * Manages all CRUD operations with auto-sync, progress calculation, and activity logging
 */

import { storage } from "./storage";
import { calculateOverallProgress, getCustomerStatus } from "./progressCalculator";
import { lockDependentSections } from "./sectionDependencies";
import { createBlankSections } from "./dataInitializer";
import {
  Customer,
  Document,
  ChecklistItem,
  WiringDetails,
  Inspection,
  Commissioning,
  ActivityLog,
  Employee,
  Status,
  Task,
} from "@/data/mockData";
import { STORAGE_CHANGE_EVENT } from "./storage";

class DataManager {
  // ==================== CUSTOMER OPERATIONS ====================

  addCustomer(customer: Customer, userName: string, userId: string): void {
    // Check for duplicate consumer number
    const existing = storage.getCustomers().find(
      (c) => c.consumerNumber === customer.consumerNumber
    );
    if (existing) {
      throw new Error("Consumer number already exists");
    }

    // Add customer
    storage.addCustomer(customer);

    // Create blank sections
    createBlankSections(customer.id);

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: customer.id,
      section: "Customer",
      action: `Created customer ${customer.name}`,
      date: new Date().toISOString(),
    });
  }

  updateCustomer(customer: Customer, userName: string, userId: string): void {
    const old = storage.getCustomer(customer.id);
    storage.updateCustomer(customer);

    // Log what changed
    const changes: string[] = [];
    if (old) {
      if (old.name !== customer.name) changes.push("name");
      if (old.mobile !== customer.mobile) changes.push("mobile");
      if (old.address !== customer.address) changes.push("address");
      if (old.systemCapacity !== customer.systemCapacity) changes.push("system capacity");
    }

    if (changes.length > 0) {
      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId: customer.id,
        section: "Customer",
        action: `Updated ${changes.join(", ")}`,
        date: new Date().toISOString(),
      });
    }
  }

  deleteCustomer(customerId: string, userName: string, userId: string): void {
    const customer = storage.getCustomer(customerId);
    if (customer) {
      storage.deleteCustomer(customerId);
      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId,
        section: "Customer",
        action: `Deleted customer ${customer.name}`,
        date: new Date().toISOString(),
      });
    }
  }

  // ==================== DOCUMENT OPERATIONS ====================

  uploadDocument(
    customerId: string,
    documentId: string,
    file: File,
    userName: string,
    userId: string
  ): void {
    const doc = storage.getDocuments().find((d) => d.id === documentId);
    if (!doc) return;

    // Store file in localStorage (base64 for demo)
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
      const fileId = `file_${Date.now()}`;
      localStorage.setItem(fileId, fileData);

      const updatedDoc: Document = {
        ...doc,
        uploaded: true,
        uploadDate: new Date().toISOString().split("T")[0],
        doneBy: userName,
        status: "in_progress",
        fileId,
      };

      storage.updateDocument(updatedDoc);

      // Recalculate progress
      this.recalculateProgress(customerId);

      // Log activity
      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId,
        section: "Documents",
        action: `Uploaded ${doc.name}`,
        date: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  }

  verifyDocument(
    documentId: string,
    verified: boolean,
    userName: string,
    userId: string
  ): void {
    const doc = storage.getDocuments().find((d) => d.id === documentId);
    if (!doc) return;

    const updatedDoc: Document = {
      ...doc,
      verified,
      verifiedBy: verified ? userName : undefined,
      status: verified ? "completed" : "in_progress",
    };

    storage.updateDocument(updatedDoc);

    // Recalculate progress
    this.recalculateProgress(doc.customerId);

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: doc.customerId,
      section: "Documents",
      action: verified ? `Verified ${doc.name}` : `Unverified ${doc.name}`,
      date: new Date().toISOString(),
    });
  }

  deleteDocument(documentId: string, userName: string, userId: string): void {
    const doc = storage.getDocuments().find((d) => d.id === documentId);
    if (!doc) return;

    // Delete file from localStorage
    if (doc.fileId) {
      localStorage.removeItem(doc.fileId);
    }

    const updatedDoc: Document = {
      ...doc,
      uploaded: false,
      uploadDate: undefined,
      fileId: undefined,
      status: "pending",
    };

    storage.updateDocument(updatedDoc);

    // Recalculate progress
    this.recalculateProgress(doc.customerId);

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: doc.customerId,
      section: "Documents",
      action: `Deleted ${doc.name}`,
      date: new Date().toISOString(),
    });
  }

  // ==================== CHECKLIST OPERATIONS ====================

  updateChecklistItem(
    item: ChecklistItem,
    userName: string,
    userId: string
  ): void {
    const old = storage.getChecklist().find((c) => c.id === item.id);
    storage.updateChecklistItem(item);

    // Recalculate progress
    this.recalculateProgress(item.customerId);

    // Lock/unlock dependent sections
    lockDependentSections(item.customerId, "checklist");

    // Log activity
    if (old && old.status !== item.status) {
      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId: item.customerId,
        section: "Checklist",
        action: `${item.status === "completed" ? "Completed" : "Updated"} ${item.task}`,
        date: new Date().toISOString(),
      });
    }
  }

  // ==================== WIRING OPERATIONS ====================

  updateWiring(
    customerId: string,
    wiring: WiringDetails,
    userName: string,
    userId: string
  ): void {
    const oldWiring = storage.getCustomerWiring(customerId);
    storage.updateWiring(customerId, wiring);

    // When wiring is completed, auto-update checklist
    if (wiring.status === "completed" && oldWiring?.status !== "completed") {
      const checklist = storage.getCustomerChecklist(customerId);
      const wiringChecklistItem = checklist.find((item) =>
        item.task.toLowerCase().includes("wiring") ||
        item.task.toLowerCase().includes("installation")
      );

      if (wiringChecklistItem) {
        storage.updateChecklistItem({
          ...wiringChecklistItem,
          status: "completed" as Status,
          doneBy: wiring.technicianName || userName,
          date: new Date().toISOString().split("T")[0],
        });

        // Log the completion activity
        this.logActivity({
          id: `act_${Date.now()}_wiring_complete`,
          user: wiring.technicianName || userName,
          userId: wiring.technicianId || userId,
          customerId,
          section: "Wiring",
          action: `Wiring completed by ${wiring.technicianName || userName}`,
          date: new Date().toISOString(),
        });
      }
    }

    // Recalculate progress
    this.recalculateProgress(customerId);

    // Lock/unlock dependent sections
    lockDependentSections(customerId, "wiring");

    // Auto-update inspection QC if applicable
    if (wiring.status === "completed") {
      this.autoUpdateInspectionQC(customerId, "wiring", userName, userId);
    }

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId,
      section: "Wiring",
      action: `Updated wiring details - Status: ${wiring.status}`,
      date: new Date().toISOString(),
    });
  }

  // ==================== INSPECTION OPERATIONS ====================

  updateInspection(
    inspection: Inspection,
    userName: string,
    userId: string
  ): void {
    storage.updateInspection(inspection);

    // Recalculate progress
    this.recalculateProgress(inspection.customerId);

    // Lock/unlock dependent sections
    lockDependentSections(inspection.customerId, "inspection");

    // If approved, unlock commissioning
    if (inspection.approvalStatus === "approved") {
      this.logActivity({
        id: `act_${Date.now()}_approved`,
        user: userName,
        userId,
        customerId: inspection.customerId,
        section: "Inspection",
        action: `QC Approved by ${inspection.approvedBy} - ${inspection.document}`,
        date: new Date().toISOString(),
      });
    }

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: inspection.customerId,
      section: "Inspection",
      action: `${inspection.approved ? "Approved" : "Updated"} ${inspection.document}`,
      date: new Date().toISOString(),
    });
  }

  // Auto-update inspection QC when documents/wiring/completion report changes
  autoUpdateInspectionQC(
    customerId: string,
    sourceSection: "documents" | "wiring" | "completion",
    userName: string,
    userId: string
  ): void {
    const inspections = storage.getCustomerInspections(customerId);
    
    if (sourceSection === "documents") {
      const documents = storage.getCustomerDocuments(customerId);
      const allDocsUploaded = documents.every((d) => d.uploaded || d.fileId);

      if (allDocsUploaded) {
        inspections.forEach((insp) => {
          if (!insp.submitted) {
            storage.updateInspection({
              ...insp,
              submitted: true,
              date: new Date().toISOString().split("T")[0],
            });
          }
        });

        this.logActivity({
          id: `act_${Date.now()}_auto_insp`,
          user: "System",
          userId: "system",
          customerId,
          section: "Inspection",
          action: "Auto-updated: All documents uploaded, marked as submitted",
          date: new Date().toISOString(),
        });
      }
    }

    if (sourceSection === "wiring") {
      const wiring = storage.getCustomerWiring(customerId);
      if (wiring?.status === "completed") {
        const wiringInspection = inspections.find((i) => 
          i.document.toLowerCase().includes("wiring") || i.document.toLowerCase().includes("installation")
        );

        if (wiringInspection && wiringInspection.status !== "completed") {
          storage.updateInspection({
            ...wiringInspection,
            status: "in_progress" as Status,
            qcName: userName,
            inspectionDate: new Date().toISOString().split("T")[0],
          });

          this.logActivity({
            id: `act_${Date.now()}_auto_insp_wiring`,
            user: "System",
            userId: "system",
            customerId,
            section: "Inspection",
            action: "Auto-updated: Wiring completed, inspection ready for QC",
            date: new Date().toISOString(),
          });
        }
      }
    }
  }

  // ==================== COMMISSIONING OPERATIONS ====================

  updateCommissioning(
    customerId: string,
    commissioning: Commissioning,
    userName: string,
    userId: string
  ): void {
    storage.updateCommissioning(customerId, commissioning);

    // Recalculate progress
    this.recalculateProgress(customerId);

    // Log activity
    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId,
      section: "Commissioning",
      action: "Updated commissioning details",
      date: new Date().toISOString(),
    });

    // Check if project is completed
    if (commissioning.status === "completed") {
      const customer = storage.getCustomer(customerId);
      if (customer) {
        this.logActivity({
          id: `act_${Date.now()}_complete`,
          user: "System",
          userId: "system",
          customerId,
          section: "Project",
          action: `Project ${customer.name} commissioned successfully ✅`,
          date: new Date().toISOString(),
        });
      }
    }
  }

  // ==================== EMPLOYEE OPERATIONS ====================

  addEmployee(employee: Employee, userName: string, userId: string): void {
    storage.addEmployee(employee);

    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: "",
      section: "Employee",
      action: `Added employee ${employee.name}`,
      date: new Date().toISOString(),
    });
  }

  updateEmployee(employee: Employee, userName: string, userId: string): void {
    storage.updateEmployee(employee);
    
    // If suspended, update all assigned tasks
    if (employee.status === "suspended") {
      const tasks = storage.getTasks().filter((t) => t.assignedTo === employee.id);
      tasks.forEach((task) => {
        storage.updateTask({ ...task, status: "pending_reassign" });
      });
    }
    
    // If unsuspended, reactivate tasks
    if (employee.status === "active") {
      const tasks = storage.getTasks().filter((t) => 
        t.assignedTo === employee.id && t.status === "pending_reassign"
      );
      tasks.forEach((task) => {
        storage.updateTask({ ...task, status: "pending" });
      });
    }

    this.logActivity({
      id: `act_${Date.now()}`,
      user: userName,
      userId,
      customerId: "",
      section: "Employee",
      action: employee.status === "suspended" 
        ? `Suspended employee ${employee.name}` 
        : employee.status === "active"
        ? `Unsuspended employee ${employee.name}`
        : `Updated employee ${employee.name}`,
      date: new Date().toISOString(),
    });
    
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }

  deleteEmployee(employeeId: string, userName: string, userId: string): void {
    const employee = storage.getEmployees().find((e) => e.id === employeeId);
    if (employee) {
      storage.deleteEmployee(employeeId);

      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId: "",
        section: "Employee",
        action: `Deleted employee ${employee.name}`,
        date: new Date().toISOString(),
      });
    }
  }

  assignEmployee(
    customerId: string,
    employeeId: string,
    userName: string,
    userId: string
  ): void {
    const customer = storage.getCustomer(customerId);
    const employee = storage.getEmployees().find((e) => e.id === employeeId);

    if (customer && employee) {
      // Update customer
      storage.updateCustomer({ ...customer, assignedTo: employeeId });

      // Update employee
      if (!employee.assignedCustomers.includes(customerId)) {
        employee.assignedCustomers.push(customerId);
        storage.updateEmployee(employee);
      }

      this.logActivity({
        id: `act_${Date.now()}`,
        user: userName,
        userId,
        customerId,
        section: "Assignment",
        action: `Assigned ${employee.name} to ${customer.name}`,
        date: new Date().toISOString(),
      });
    }
  }

  // ==================== TASK MANAGEMENT WITH TWO-WAY BINDING ====================

  addTask(task: Task, userName: string, userId: string): void {
    storage.addTask(task);
    
    // If technician role, update wiring section
    if (task.role === "technician") {
      const wiring = storage.getCustomerWiring(task.customerId);
      const employee = storage.getEmployees().find((e) => e.id === task.assignedTo);
      
      if (wiring && employee) {
        storage.updateWiring(task.customerId, {
          ...wiring,
          technicianName: employee.name,
          technicianId: employee.id,
          startDate: task.startDate,
          endDate: task.endDate,
          status: "in_progress" as Status,
        });

        // Also update checklist to show assigned employee
        const checklist = storage.getCustomerChecklist(task.customerId);
        const wiringChecklistItem = checklist.find((item) =>
          item.task.toLowerCase().includes("wiring") ||
          item.task.toLowerCase().includes("installation")
        );

        if (wiringChecklistItem) {
          storage.updateChecklistItem({
            ...wiringChecklistItem,
            assignedEmployeeId: employee.id,
            assignedEmployeeName: employee.name,
            startDate: task.startDate,
            endDate: task.endDate,
          });
        }
      }
    }

    this.logActivity({
      id: `act${Date.now()}`,
      user: userName,
      userId: userId,
      customerId: task.customerId,
      section: "Tasks",
      action: `Created task: ${task.title}`,
      date: new Date().toISOString(),
    });
    this.recalculateProgress(task.customerId);
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }

  updateTask(taskId: string, updates: Partial<Task>, userName: string, userId: string): void {
    const task = storage.getTasks().find((t) => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, ...updates };
    storage.updateTask(updatedTask);

    // Update wiring section if technician task dates change
    if (task.role === "technician" && (updates.startDate || updates.endDate || updates.status)) {
      const wiring = storage.getCustomerWiring(task.customerId);
      if (wiring) {
        storage.updateWiring(task.customerId, {
          ...wiring,
          startDate: updates.startDate || wiring.startDate,
          endDate: updates.endDate || wiring.endDate,
          status: updates.status === "completed" ? "completed" as Status : wiring.status,
        });

        // Auto-update checklist when task status changes
        const checklist = storage.getCustomerChecklist(task.customerId);
        const wiringChecklistItem = checklist.find((item) =>
          item.task.toLowerCase().includes("wiring") ||
          item.task.toLowerCase().includes("installation")
        );

        if (wiringChecklistItem && updates.status) {
          storage.updateChecklistItem({
            ...wiringChecklistItem,
            status: updates.status === "completed" ? "completed" as Status : wiringChecklistItem.status,
            doneBy: updates.status === "completed" ? wiring.technicianName || userName : wiringChecklistItem.doneBy,
            date: updates.status === "completed" ? new Date().toISOString().split("T")[0] : wiringChecklistItem.date,
          });
        }
      }
    }

    this.logActivity({
      id: `act${Date.now()}`,
      user: userName,
      userId: userId,
      customerId: task.customerId,
      section: "Tasks",
      action: `Updated task: ${task.title}`,
      date: new Date().toISOString(),
    });
    this.recalculateProgress(task.customerId);
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }

  // Check task deadlines
  checkTaskDeadlines(): { nearDeadline: Task[]; overdue: Task[] } {
    const tasks = storage.getTasks();
    const today = new Date();
    const nearDeadline: Task[] = [];
    const overdue: Task[] = [];

    tasks.forEach((task) => {
      if (task.status === "completed" || task.status === "pending_reassign") return;

      const endDate = new Date(task.endDate);
      const daysUntilDue = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue < 0) {
        overdue.push(task);
      } else if (daysUntilDue <= 3) {
        nearDeadline.push(task);
      }
    });

    return { nearDeadline, overdue };
  }

  // Inspection with rework flow
  updateInspectionWithRework(
    inspection: Inspection,
    approved: boolean,
    userName: string,
    userId: string
  ): void {
    const updated = { ...inspection, approved, status: (approved ? "completed" : "rejected") as Status };
    storage.updateInspection(updated);

    if (!approved) {
      // Reopen wiring for rework
      const wiring = storage.getCustomerWiring(inspection.customerId);
      if (wiring) {
        storage.updateWiring(inspection.customerId, {
          ...wiring,
          status: "in_progress" as Status,
        });
      }

      // Create rework task for technician
      const technicianTask = storage.getTasks().find((t) => 
        t.customerId === inspection.customerId && t.role === "technician"
      );

      if (technicianTask) {
        const reworkTask: Task = {
          id: `task${Date.now()}`,
          customerId: inspection.customerId,
          title: `Rework Required - ${inspection.document}`,
          description: `Inspection rejected. Please address issues and resubmit.`,
          assignedTo: technicianTask.assignedTo,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "in_progress",
          priority: "high",
          role: "technician",
          createdBy: userName,
          createdDate: new Date().toISOString().split("T")[0],
        };
        storage.addTask(reworkTask);
      }

      this.logActivity({
        id: `act${Date.now()}`,
        user: userName,
        userId: userId,
        customerId: inspection.customerId,
        section: "Inspection",
        action: `Inspection rejected for ${inspection.document} - Rework assigned`,
        date: new Date().toISOString(),
      });
    } else {
      this.logActivity({
        id: `act${Date.now()}`,
        user: userName,
        userId: userId,
        customerId: inspection.customerId,
        section: "Inspection",
        action: `Inspection approved for ${inspection.document}`,
        date: new Date().toISOString(),
      });
    }

    this.recalculateProgress(inspection.customerId);
    lockDependentSections(inspection.customerId, "inspection");
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  }

  // ==================== PROGRESS CALCULATION ====================

  recalculateProgress(customerId: string): void {
    const progress = calculateOverallProgress(customerId);
    const status = getCustomerStatus(customerId);
    
    const customer = storage.getCustomer(customerId);
    if (customer) {
      // Update customer with new progress
      // Note: Customer interface doesn't have progress field in mockData
      // But we can calculate it on demand
      
      // Log auto-update
      this.logActivity({
        id: `act_${Date.now()}_auto`,
        user: "System",
        userId: "system",
        customerId,
        section: "Progress",
        action: `Progress updated to ${progress}% (${status})`,
        date: new Date().toISOString(),
      });
    }
  }

  // ==================== ACTIVITY LOG ====================

  logActivity(activity: ActivityLog): void {
    storage.addActivity(activity);
  }

  getActivities(filters?: {
    customerId?: string;
    userId?: string;
    section?: string;
    limit?: number;
  }): ActivityLog[] {
    let activities = storage.getActivities();

    if (filters?.customerId) {
      activities = activities.filter((a) => a.customerId === filters.customerId);
    }

    if (filters?.userId) {
      activities = activities.filter((a) => a.userId === filters.userId);
    }

    if (filters?.section) {
      activities = activities.filter((a) => a.section === filters.section);
    }

    if (filters?.limit) {
      activities = activities.slice(0, filters.limit);
    }

    return activities;
  }

  // ==================== IMPORT / EXPORT ====================

  importCustomers(customers: Partial<Customer>[], userName: string, userId: string): number {
    let importedCount = 0;

    customers.forEach((customerData) => {
      // Skip if consumer number exists
      const exists = storage.getCustomers().some(
        (c) => c.consumerNumber === customerData.consumerNumber
      );

      if (!exists && customerData.consumerNumber) {
        const customer: Customer = {
          id: `CUST${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: customerData.name || "",
          consumerNumber: customerData.consumerNumber,
          mobile: customerData.mobile || "",
          address: customerData.address || "",
          systemCapacity: customerData.systemCapacity || 0,
          orderAmount: customerData.orderAmount || 0,
          orderDate: customerData.orderDate || new Date().toISOString().split("T")[0],
          approvalStatus: "pending",
          locked: false,
        };

        this.addCustomer(customer, userName, userId);
        importedCount++;
      }
    });

    return importedCount;
  }
}

export const dataManager = new DataManager();
