/**
 * Data Initializer
 * Initializes mock data on first load
 */

import { storage } from "./storage";
import {
  mockCustomers,
  mockDocuments,
  mockChecklist,
  mockWiring,
  mockInspections,
  mockCommissioning,
  mockActivities,
  mockEmployees,
  Customer,
  Document,
  ChecklistItem,
  WiringDetails,
  Inspection,
  Commissioning,
} from "@/data/mockData";

// Document templates for new customers
const documentTemplates = [
  "Aadhaar Card",
  "Light Bill",
  "7/12 & Index 2",
  "Undertaking Letter",
  "Notary",
  "Site Photos",
  "Roof Layout",
];

// Checklist templates for new customers
const checklistTemplates = [
  "New Connection",
  "Email & Mobile Update",
  "Load Extension",
  "PV Application",
  "Net Meter Application",
  "Sanction Approval",
  "Jansamarth Documentation",
];

// Inspection templates for new customers
const inspectionTemplates = [
  "Work Completion Report",
  "Site Inspection",
  "Quality Check",
  "Safety Compliance",
];

// Create blank sections for a new customer
export function createBlankSections(customerId: string): void {
  // Create blank documents
  documentTemplates.forEach((docName, index) => {
    const doc: Document = {
      id: `${customerId}_doc_${index}`,
      customerId,
      name: docName,
      uploaded: false,
      status: "pending",
    };
    storage.addDocument(doc);
  });

  // Create blank checklist
  checklistTemplates.forEach((task, index) => {
    const item: ChecklistItem = {
      id: `${customerId}_check_${index}`,
      customerId,
      task,
      status: "pending",
    };
    storage.getChecklist().push(item);
  });
  storage.setChecklist(storage.getChecklist());

  // Create blank wiring
  const wiring: WiringDetails = {
    customerId,
    status: "pending",
  };
  storage.updateWiring(customerId, wiring);

  // Create blank inspections
  inspectionTemplates.forEach((docName, index) => {
    const inspection: Inspection = {
      id: `${customerId}_insp_${index}`,
      customerId,
      document: docName,
      submitted: false,
      approved: false,
      status: "pending",
    };
    storage.getInspections().push(inspection);
  });
  storage.setInspections(storage.getInspections());

  // Create blank commissioning
  const commissioning: Commissioning = {
    customerId,
    status: "pending",
  };
  storage.updateCommissioning(customerId, commissioning);
}

// Initialize with mock data
export function initializeMockData(): void {
  // Check if already initialized
  const customers = storage.getCustomers();
  if (customers.length > 0) {
    console.log("Data already initialized");
    return;
  }

  console.log("Initializing mock data...");

  // Add employees
  mockEmployees.forEach((employee) => {
    storage.addEmployee(employee);
  });

  // Add customers
  mockCustomers.forEach((customer) => {
    storage.addCustomer(customer);
  });

  // Add documents
  mockDocuments.forEach((doc) => {
    storage.addDocument(doc);
  });

  // Add checklist
  storage.setChecklist(mockChecklist);

  // Add wiring
  storage.setWiring(mockWiring);

  // Add inspections
  storage.setInspections(mockInspections);

  // Add commissioning
  storage.setCommissioning(mockCommissioning);

  // Add activities
  storage.setActivities(mockActivities);

  // Create blank sections for customers without data
  mockCustomers.forEach((customer) => {
    const hasDocuments = mockDocuments.some((d) => d.customerId === customer.id);
    if (!hasDocuments) {
      createBlankSections(customer.id);
    }
  });

  console.log("Mock data initialized successfully");
}

// Reset all data
export function resetData(): void {
  storage.clearAll();
  initializeMockData();
}
