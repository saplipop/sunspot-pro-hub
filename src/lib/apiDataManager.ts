/**
 * API Data Manager for Solar Project Management System
 * Handles all data synchronization with backend API
 */

import customerService from "@/services/customerService";
import documentService from "@/services/documentService";
import checklistService from "@/services/checklistService";
import wiringService from "@/services/wiringService";
import inspectionService from "@/services/inspectionService";
import employeeService from "@/services/employeeService";
import { Customer, Document, ChecklistItem, WiringDetails, Inspection, Employee } from "@/data/mockData";

class ApiDataManager {
  // Customer operations
  async getCustomers(params?: any): Promise<Customer[]> {
    return await customerService.getAll(params);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return await customerService.getById(id);
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    return await customerService.create(customer);
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    return await customerService.update(customer.id, customer);
  }

  async deleteCustomer(id: string): Promise<void> {
    await customerService.delete(id);
  }

  // Document operations
  async getCustomerDocuments(customerId: string): Promise<Document[]> {
    return await documentService.getCustomerDocuments(customerId);
  }

  async updateDocument(customerId: string, document: Document): Promise<Document> {
    return await documentService.update(customerId, document.id, document);
  }

  async uploadDocumentFile(
    customerId: string,
    documentId: string,
    file: File,
    documentNumber: string
  ): Promise<{ fileId: string; fileUrl: string }> {
    return await documentService.uploadFile(customerId, documentId, file, documentNumber);
  }

  // Checklist operations
  async getCustomerChecklist(customerId: string): Promise<ChecklistItem[]> {
    return await checklistService.getCustomerChecklist(customerId);
  }

  async updateChecklistItem(customerId: string, item: ChecklistItem): Promise<ChecklistItem> {
    return await checklistService.updateItem(customerId, item.id, item);
  }

  // Wiring operations
  async getCustomerWiring(customerId: string): Promise<WiringDetails | null> {
    return await wiringService.getCustomerWiring(customerId);
  }

  async updateWiring(customerId: string, wiring: WiringDetails): Promise<WiringDetails> {
    return await wiringService.update(customerId, wiring);
  }

  // Inspection operations
  async getCustomerInspections(customerId: string): Promise<Inspection[]> {
    return await inspectionService.getCustomerInspections(customerId);
  }

  async updateInspection(customerId: string, inspection: Inspection): Promise<Inspection> {
    return await inspectionService.update(customerId, inspection.id, inspection);
  }

  // Employee operations
  async getEmployees(params?: any): Promise<Employee[]> {
    return await employeeService.getAll(params);
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return await employeeService.getById(id);
  }

  async addEmployee(employee: Employee): Promise<Employee> {
    return await employeeService.create(employee);
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    return await employeeService.update(employee.id, employee);
  }

  async deleteEmployee(id: string): Promise<void> {
    await employeeService.delete(id);
  }
}

export const apiDataManager = new ApiDataManager();
