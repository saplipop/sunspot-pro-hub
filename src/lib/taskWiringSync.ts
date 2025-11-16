/**
 * Task-Wiring Synchronization Manager
 * Ensures tasks and wiring records are interconnected and synchronized
 */

import { storage } from "./storage";
import { Task, WiringDetails, ChecklistItem } from "@/data/mockData";

export interface TaskWiringSyncPayload {
  customerId: string;
  employeeId: string;
  employeeName: string;
  taskTitle: string;
  taskDescription: string;
  startDate: string;
  endDate: string;
  priority: "low" | "medium" | "high";
  role: "technician" | "inspector" | "admin" | "other";
}

class TaskWiringSyncManager {
  /**
   * Create a task and automatically create/link wiring record
   */
  createTaskWithWiring(payload: TaskWiringSyncPayload): { taskId: string; wiringCreated: boolean } {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the task
    const task: Task = {
      id: taskId,
      customerId: payload.customerId,
      assignedTo: payload.employeeId,
      title: payload.taskTitle,
      description: payload.taskDescription,
      startDate: payload.startDate,
      endDate: payload.endDate,
      priority: payload.priority,
      status: "pending",
      role: payload.role,
      createdBy: payload.employeeName,
      createdDate: new Date().toISOString(),
    };

    storage.addTask(task);

    // If role is technician, create/update wiring record
    let wiringCreated = false;
    if (payload.role === "technician") {
      const existingWiring = storage.getCustomerWiring(payload.customerId);
      
      const wiringData: WiringDetails = {
        customerId: payload.customerId,
        technicianId: payload.employeeId,
        technicianName: payload.employeeName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: "pending",
        remark: `Linked to task: ${payload.taskTitle}`,
        ...(existingWiring || {}),
      };

      storage.updateWiring(payload.customerId, wiringData);
      wiringCreated = true;

      // Link checklist items to this task
      this.linkChecklistToTask(payload.customerId, taskId, payload.employeeId, payload.employeeName);
    }

    // Log activity
    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: payload.employeeName,
      userId: payload.employeeId,
      customerId: payload.customerId,
      section: "Task Management",
      action: `Created ${payload.role} task: ${payload.taskTitle}${wiringCreated ? " (Wiring auto-linked)" : ""}`,
      date: new Date().toISOString(),
    });

    return { taskId, wiringCreated };
  }

  /**
   * Update task and sync changes to wiring
   */
  updateTaskAndSync(taskId: string, updates: Partial<Task>): void {
    const tasks = storage.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;

    const updatedTask = { ...task, ...updates };
    storage.updateTask(updatedTask);

    // If technician task, sync to wiring
    if (task.role === "technician") {
      const wiring = storage.getCustomerWiring(task.customerId);
      
      if (wiring) {
        storage.updateWiring(task.customerId, {
          ...wiring,
          startDate: updatedTask.startDate,
          endDate: updatedTask.endDate,
          status: updatedTask.status === "completed" ? "completed" : updatedTask.status === "in_progress" ? "in_progress" : "pending",
        });
      }

      // Update linked checklist items
      if (updates.endDate) {
        this.updateChecklistDates(task.customerId, updates.endDate);
      }
    }

    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: "System",
      userId: "system",
      customerId: task.customerId,
      section: "Task Management",
      action: `Task updated: ${task.title} - Changes synced to wiring`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Update wiring and sync back to task
   */
  updateWiringAndSync(customerId: string, wiringUpdates: Partial<WiringDetails>): void {
    const wiring = storage.getCustomerWiring(customerId);
    
    if (!wiring) return;

    storage.updateWiring(customerId, { ...wiring, ...wiringUpdates });

    // Find and update related technician tasks
    const tasks = storage.getCustomerTasks(customerId);
    const technicianTasks = tasks.filter((t) => t.role === "technician" && t.assignedTo === wiring.technicianId);

    technicianTasks.forEach((task) => {
      storage.updateTask({
        ...task,
        startDate: wiringUpdates.startDate || task.startDate,
        endDate: wiringUpdates.endDate || task.endDate,
        status: wiringUpdates.status === "completed" ? "completed" : wiringUpdates.status === "in_progress" ? "in_progress" : task.status,
      });
    });

    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: "System",
      userId: "system",
      customerId,
      section: "Wiring",
      action: `Wiring updated - Changes synced to tasks`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Extend task deadline
   */
  extendTaskDeadline(taskId: string, newEndDate: string, reason: string, adminName: string): void {
    const tasks = storage.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) return;

    const oldEndDate = task.endDate;
    
    storage.updateTask({
      ...task,
      endDate: newEndDate,
    });

    // Sync to wiring if technician task
    if (task.role === "technician") {
      const wiring = storage.getCustomerWiring(task.customerId);
      if (wiring) {
        storage.updateWiring(task.customerId, {
          ...wiring,
          endDate: newEndDate,
          remark: `${wiring.remark || ""}\nDeadline extended: ${reason}`,
        });
      }

      // Update checklist items
      this.updateChecklistDates(task.customerId, newEndDate);
    }

    // Log extension
    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: adminName,
      userId: "admin",
      customerId: task.customerId,
      section: "Task Extension",
      action: `Extended deadline for "${task.title}": ${oldEndDate} → ${newEndDate}. Reason: ${reason}`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Link checklist items to task
   */
  private linkChecklistToTask(customerId: string, taskId: string, employeeId: string, employeeName: string): void {
    const checklist = storage.getCustomerChecklist(customerId);
    
    checklist.forEach((item) => {
      if (item.status === "pending" || !item.assignedEmployeeId) {
        storage.updateChecklistItem({
          ...item,
          assignedEmployeeId: employeeId,
          assignedEmployeeName: employeeName,
        });
      }
    });
  }

  /**
   * Update checklist item dates when task dates change
   */
  private updateChecklistDates(customerId: string, newEndDate: string): void {
    const checklist = storage.getCustomerChecklist(customerId);
    
    checklist.forEach((item) => {
      storage.updateChecklistItem({
        ...item,
        endDate: newEndDate,
      });
    });
  }

  /**
   * Check if checklist can be completed (date validation)
   */
  canCompleteChecklist(checklistItem: ChecklistItem): { allowed: boolean; reason?: string } {
    if (!checklistItem.endDate) {
      return { allowed: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(checklistItem.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (today < endDate) {
      return {
        allowed: false,
        reason: `Task end date not reached. Cannot complete before ${checklistItem.endDate}. Please extend the deadline or wait.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Complete wiring task and auto-complete linked checklist items
   */
  completeWiringTask(customerId: string, technicianName: string): void {
    // Update wiring status
    const wiring = storage.getCustomerWiring(customerId);
    if (wiring) {
      storage.updateWiring(customerId, {
        ...wiring,
        status: "completed",
      });
    }

    // Auto-complete checklist items
    const checklist = storage.getCustomerChecklist(customerId);
    checklist.forEach((item) => {
      if (item.assignedEmployeeName === technicianName && item.status !== "completed") {
        storage.updateChecklistItem({
          ...item,
          status: "completed",
          doneBy: technicianName,
          date: new Date().toISOString().split("T")[0],
        });
      }
    });

    // Update tasks
    const tasks = storage.getCustomerTasks(customerId);
    tasks.forEach((task) => {
      if (task.role === "technician" && task.status !== "completed") {
        storage.updateTask({
          ...task,
          status: "completed",
        });
      }
    });

    storage.addActivity({
      id: `activity_${Date.now()}`,
      user: technicianName,
      userId: "system",
      customerId,
      section: "Wiring Completion",
      action: `Wiring completed by ${technicianName} - Checklist items auto-completed`,
      date: new Date().toISOString(),
    });
  }

  /**
   * Handle technician suspension - move tasks to pending_reassign
   */
  handleTechnicianSuspension(employeeId: string, adminName: string): string[] {
    const allTasks = storage.getTasks();
    const affectedCustomers: string[] = [];

    allTasks.forEach((task) => {
      if (task.assignedTo === employeeId && task.status !== "completed") {
        storage.updateTask({
          ...task,
          status: "pending_reassign",
        });

        affectedCustomers.push(task.customerId);

        storage.addActivity({
          id: `activity_${Date.now()}`,
          user: adminName,
          userId: "admin",
          customerId: task.customerId,
          section: "Task Management",
          action: `Task "${task.title}" moved to pending reassignment due to technician suspension`,
          date: new Date().toISOString(),
        });
      }
    });

    return [...new Set(affectedCustomers)];
  }

  /**
   * Get task-wiring link status
   */
  getTaskWiringLink(taskId: string): {
    hasWiringLink: boolean;
    wiringData?: WiringDetails;
    customerId?: string;
  } {
    const tasks = storage.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.role !== "technician") {
      return { hasWiringLink: false };
    }

    const wiring = storage.getCustomerWiring(task.customerId);

    return {
      hasWiringLink: !!wiring && wiring.technicianId === task.assignedTo,
      wiringData: wiring || undefined,
      customerId: task.customerId,
    };
  }
}

export const taskWiringSyncManager = new TaskWiringSyncManager();
