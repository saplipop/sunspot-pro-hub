/**
 * Local Storage Manager for SolarFlow Track
 * Handles all data persistence and synchronization
 */

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
  NewConnection,
  Sanction,
  Jansamarth,
  CompletionReport,
  RTSDocument,
  ReleaseOrder,
  MeterFitting,
  Task,
} from "@/data/mockData";

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: "solar_customers",
  DOCUMENTS: "solar_documents",
  CHECKLIST: "solar_checklist",
  WIRING: "solar_wiring",
  INSPECTION: "solar_inspection",
  COMMISSIONING: "solar_commissioning",
  ACTIVITIES: "solar_activities",
  EMPLOYEES: "solar_employees",
  NEW_CONNECTION: "solar_new_connection",
  SANCTION: "solar_sanction",
  JANSAMARTH: "solar_jansamarth",
  COMPLETION_REPORT: "solar_completion_report",
  RTS_DOCUMENTS: "solar_rts_documents",
  RELEASE_ORDER: "solar_release_order",
  METER_FITTING: "solar_meter_fitting",
  TASKS: "solar_tasks",
};

// Event for storage changes
export const STORAGE_CHANGE_EVENT = "solar_storage_change";

class StorageManager {
  // Dispatch custom event when storage changes
  private notifyChange(section: string) {
    window.dispatchEvent(
      new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { section } })
    );
  }

  // Generic get/set methods
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T, section?: string): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (section) {
        this.notifyChange(section);
      }
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  // Customer operations
  getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  }

  setCustomers(customers: Customer[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers, "customers");
  }

  getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id);
  }

  addCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    customers.push(customer);
    this.setCustomers(customers);
  }

  updateCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id);
    if (index !== -1) {
      customers[index] = customer;
      this.setCustomers(customers);
    }
  }

  deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== id);
    this.setCustomers(customers);
    // Also clean up related data
    this.deleteCustomerData(id);
  }

  // Document operations
  getDocuments(): Document[] {
    return this.getItem<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
  }

  setDocuments(documents: Document[]): void {
    this.setItem(STORAGE_KEYS.DOCUMENTS, documents, "documents");
  }

  getCustomerDocuments(customerId: string): Document[] {
    return this.getDocuments().filter((d) => d.customerId === customerId);
  }

  addDocument(document: Document): void {
    const documents = this.getDocuments();
    documents.push(document);
    this.setDocuments(documents);
  }

  updateDocument(document: Document): void {
    const documents = this.getDocuments();
    const index = documents.findIndex((d) => d.id === document.id);
    if (index !== -1) {
      documents[index] = document;
      this.setDocuments(documents);
    }
  }

  // Checklist operations
  getChecklist(): ChecklistItem[] {
    return this.getItem<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, []);
  }

  setChecklist(checklist: ChecklistItem[]): void {
    this.setItem(STORAGE_KEYS.CHECKLIST, checklist, "checklist");
  }

  getCustomerChecklist(customerId: string): ChecklistItem[] {
    return this.getChecklist().filter((c) => c.customerId === customerId);
  }

  updateChecklistItem(item: ChecklistItem): void {
    const checklist = this.getChecklist();
    const index = checklist.findIndex((c) => c.id === item.id);
    if (index !== -1) {
      checklist[index] = item;
      this.setChecklist(checklist);
    }
  }

  // Wiring operations
  getWiring(): Record<string, WiringDetails> {
    return this.getItem<Record<string, WiringDetails>>(STORAGE_KEYS.WIRING, {});
  }

  setWiring(wiring: Record<string, WiringDetails>): void {
    this.setItem(STORAGE_KEYS.WIRING, wiring, "wiring");
  }

  getCustomerWiring(customerId: string): WiringDetails | undefined {
    return this.getWiring()[customerId];
  }

  updateWiring(customerId: string, wiring: WiringDetails): void {
    const allWiring = this.getWiring();
    allWiring[customerId] = wiring;
    this.setWiring(allWiring);
  }

  // Inspection operations
  getInspections(): Inspection[] {
    return this.getItem<Inspection[]>(STORAGE_KEYS.INSPECTION, []);
  }

  setInspections(inspections: Inspection[]): void {
    this.setItem(STORAGE_KEYS.INSPECTION, inspections, "inspection");
  }

  getCustomerInspections(customerId: string): Inspection[] {
    return this.getInspections().filter((i) => i.customerId === customerId);
  }

  updateInspection(inspection: Inspection): void {
    const inspections = this.getInspections();
    const index = inspections.findIndex((i) => i.id === inspection.id);
    if (index !== -1) {
      inspections[index] = inspection;
      this.setInspections(inspections);
    }
  }

  // Commissioning operations
  getCommissioning(): Record<string, Commissioning> {
    return this.getItem<Record<string, Commissioning>>(STORAGE_KEYS.COMMISSIONING, {});
  }

  setCommissioning(commissioning: Record<string, Commissioning>): void {
    this.setItem(STORAGE_KEYS.COMMISSIONING, commissioning, "commissioning");
  }

  getCustomerCommissioning(customerId: string): Commissioning | undefined {
    return this.getCommissioning()[customerId];
  }

  updateCommissioning(customerId: string, commissioning: Commissioning): void {
    const allCommissioning = this.getCommissioning();
    allCommissioning[customerId] = commissioning;
    this.setCommissioning(allCommissioning);
  }

  // Activity log operations
  getActivities(): ActivityLog[] {
    return this.getItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
  }

  setActivities(activities: ActivityLog[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITIES, activities, "activities");
  }

  addActivity(activity: ActivityLog): void {
    const activities = this.getActivities();
    activities.unshift(activity); // Add to beginning
    // Keep only last 500 activities
    if (activities.length > 500) {
      activities.length = 500;
    }
    this.setActivities(activities);
  }

  getCustomerActivities(customerId: string): ActivityLog[] {
    return this.getActivities().filter((a) => a.customerId === customerId);
  }

  // Employee operations
  getEmployees(): Employee[] {
    return this.getItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
  }

  setEmployees(employees: Employee[]): void {
    this.setItem(STORAGE_KEYS.EMPLOYEES, employees, "employees");
  }

  addEmployee(employee: Employee): void {
    const employees = this.getEmployees();
    employees.push(employee);
    this.setEmployees(employees);
  }

  updateEmployee(employee: Employee): void {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
      this.setEmployees(employees);
    }
  }

  deleteEmployee(id: string): void {
    const employees = this.getEmployees().filter((e) => e.id !== id);
    this.setEmployees(employees);
  }

  // Task operations
  getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, []);
  }

  setTasks(tasks: Task[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks, "tasks");
  }

  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    this.setTasks(tasks);
  }

  updateTask(task: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      this.setTasks(tasks);
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    this.setTasks(tasks);
  }

  getCustomerTasks(customerId: string): Task[] {
    return this.getTasks().filter((t) => t.customerId === customerId);
  }

  getEmployeeTasks(employeeId: string): Task[] {
    return this.getTasks().filter((t) => t.assignedTo === employeeId);
  }

  // New Connection operations
  getNewConnections(): NewConnection[] {
    return this.getItem<NewConnection[]>(STORAGE_KEYS.NEW_CONNECTION, []);
  }

  setNewConnections(connections: NewConnection[]): void {
    this.setItem(STORAGE_KEYS.NEW_CONNECTION, connections, "new_connection");
  }

  getCustomerNewConnections(customerId: string): NewConnection[] {
    return this.getNewConnections().filter((nc) => nc.customerId === customerId);
  }

  updateNewConnection(connection: NewConnection): void {
    const connections = this.getNewConnections();
    const index = connections.findIndex((nc) => nc.id === connection.id);
    if (index !== -1) {
      connections[index] = connection;
      this.setNewConnections(connections);
    }
  }

  // Sanction operations
  getSanctions(): Record<string, Sanction> {
    return this.getItem<Record<string, Sanction>>(STORAGE_KEYS.SANCTION, {});
  }

  setSanctions(sanctions: Record<string, Sanction>): void {
    this.setItem(STORAGE_KEYS.SANCTION, sanctions, "sanction");
  }

  getCustomerSanction(customerId: string): Sanction | undefined {
    return this.getSanctions()[customerId];
  }

  updateSanction(customerId: string, sanction: Sanction): void {
    const sanctions = this.getSanctions();
    sanctions[customerId] = sanction;
    this.setSanctions(sanctions);
  }

  // Jansamarth operations
  getJansamarth(): Jansamarth[] {
    return this.getItem<Jansamarth[]>(STORAGE_KEYS.JANSAMARTH, []);
  }

  setJansamarth(jansamarth: Jansamarth[]): void {
    this.setItem(STORAGE_KEYS.JANSAMARTH, jansamarth, "jansamarth");
  }

  getCustomerJansamarth(customerId: string): Jansamarth[] {
    return this.getJansamarth().filter((j) => j.customerId === customerId);
  }

  updateJansamarth(item: Jansamarth): void {
    const jansamarth = this.getJansamarth();
    const index = jansamarth.findIndex((j) => j.id === item.id);
    if (index !== -1) {
      jansamarth[index] = item;
      this.setJansamarth(jansamarth);
    }
  }

  // Completion Report operations
  getCompletionReports(): CompletionReport[] {
    return this.getItem<CompletionReport[]>(STORAGE_KEYS.COMPLETION_REPORT, []);
  }

  setCompletionReports(reports: CompletionReport[]): void {
    this.setItem(STORAGE_KEYS.COMPLETION_REPORT, reports, "completion_report");
  }

  getCustomerCompletionReports(customerId: string): CompletionReport[] {
    return this.getCompletionReports().filter((cr) => cr.customerId === customerId);
  }

  updateCompletionReport(report: CompletionReport): void {
    const reports = this.getCompletionReports();
    const index = reports.findIndex((r) => r.id === report.id);
    if (index !== -1) {
      reports[index] = report;
      this.setCompletionReports(reports);
    }
  }

  // RTS Documents operations
  getRTSDocuments(): RTSDocument[] {
    return this.getItem<RTSDocument[]>(STORAGE_KEYS.RTS_DOCUMENTS, []);
  }

  setRTSDocuments(docs: RTSDocument[]): void {
    this.setItem(STORAGE_KEYS.RTS_DOCUMENTS, docs, "rts_documents");
  }

  getCustomerRTSDocuments(customerId: string): RTSDocument[] {
    return this.getRTSDocuments().filter((rts) => rts.customerId === customerId);
  }

  updateRTSDocument(doc: RTSDocument): void {
    const docs = this.getRTSDocuments();
    const index = docs.findIndex((d) => d.id === doc.id);
    if (index !== -1) {
      docs[index] = doc;
      this.setRTSDocuments(docs);
    }
  }

  // Release Order operations
  getReleaseOrders(): Record<string, ReleaseOrder> {
    return this.getItem<Record<string, ReleaseOrder>>(STORAGE_KEYS.RELEASE_ORDER, {});
  }

  setReleaseOrders(orders: Record<string, ReleaseOrder>): void {
    this.setItem(STORAGE_KEYS.RELEASE_ORDER, orders, "release_order");
  }

  getCustomerReleaseOrder(customerId: string): ReleaseOrder | undefined {
    return this.getReleaseOrders()[customerId];
  }

  updateReleaseOrder(customerId: string, order: ReleaseOrder): void {
    const orders = this.getReleaseOrders();
    orders[customerId] = order;
    this.setReleaseOrders(orders);
  }

  // Meter Fitting operations
  getMeterFittings(): Record<string, MeterFitting> {
    return this.getItem<Record<string, MeterFitting>>(STORAGE_KEYS.METER_FITTING, {});
  }

  setMeterFittings(fittings: Record<string, MeterFitting>): void {
    this.setItem(STORAGE_KEYS.METER_FITTING, fittings, "meter_fitting");
  }

  getCustomerMeterFitting(customerId: string): MeterFitting | undefined {
    return this.getMeterFittings()[customerId];
  }

  updateMeterFitting(customerId: string, fitting: MeterFitting): void {
    const fittings = this.getMeterFittings();
    fittings[customerId] = fitting;
    this.setMeterFittings(fittings);
  }

  // Clean up all data for a customer
  private deleteCustomerData(customerId: string): void {
    // Remove documents
    const documents = this.getDocuments().filter((d) => d.customerId !== customerId);
    this.setItem(STORAGE_KEYS.DOCUMENTS, documents);

    // Remove checklist
    const checklist = this.getChecklist().filter((c) => c.customerId !== customerId);
    this.setItem(STORAGE_KEYS.CHECKLIST, checklist);

    // Remove wiring
    const wiring = this.getWiring();
    delete wiring[customerId];
    this.setItem(STORAGE_KEYS.WIRING, wiring);

    // Remove inspections
    const inspections = this.getInspections().filter((i) => i.customerId !== customerId);
    this.setItem(STORAGE_KEYS.INSPECTION, inspections);

    // Remove commissioning
    const commissioning = this.getCommissioning();
    delete commissioning[customerId];
    this.setItem(STORAGE_KEYS.COMMISSIONING, commissioning);

    // Remove new connections
    const newConnections = this.getNewConnections().filter((nc) => nc.customerId !== customerId);
    this.setItem(STORAGE_KEYS.NEW_CONNECTION, newConnections);

    // Remove sanction
    const sanctions = this.getSanctions();
    delete sanctions[customerId];
    this.setItem(STORAGE_KEYS.SANCTION, sanctions);

    // Remove jansamarth
    const jansamarth = this.getJansamarth().filter((j) => j.customerId !== customerId);
    this.setItem(STORAGE_KEYS.JANSAMARTH, jansamarth);

    // Remove completion reports
    const completionReports = this.getCompletionReports().filter((cr) => cr.customerId !== customerId);
    this.setItem(STORAGE_KEYS.COMPLETION_REPORT, completionReports);

    // Remove RTS documents
    const rtsDocuments = this.getRTSDocuments().filter((rts) => rts.customerId !== customerId);
    this.setItem(STORAGE_KEYS.RTS_DOCUMENTS, rtsDocuments);

    // Remove release order
    const releaseOrders = this.getReleaseOrders();
    delete releaseOrders[customerId];
    this.setItem(STORAGE_KEYS.RELEASE_ORDER, releaseOrders);

    // Remove meter fitting
    const meterFittings = this.getMeterFittings();
    delete meterFittings[customerId];
    this.setItem(STORAGE_KEYS.METER_FITTING, meterFittings);

    // Keep activities for audit trail
  }

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    this.notifyChange("all");
  }

  // Initialize with mock data if empty
  initializeMockData(): void {
    if (this.getCustomers().length === 0) {
      // Will be populated by the data manager
      this.notifyChange("all");
    }
  }
}

export const storage = new StorageManager();
