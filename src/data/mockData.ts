export type Status = "pending" | "in_progress" | "completed";
export type ApprovalStatus = "pending" | "verified" | "completed";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "active" | "suspended";
  assignedCustomers: string[];
  createdBy: string;
  createdDate: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
}

export interface Task {
  id: string;
  customerId: string;
  assignedTo: string; // employee ID
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "pending_reassign";
  role?: "technician" | "inspector" | "admin" | "other";
  createdBy: string;
  createdDate: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  userId: string;
  customerId: string;
  section: string;
  action: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  consumerNumber: string;
  mobile: string;
  address: string;
  systemCapacity: number;
  orderAmount: number;
  orderDate: string;
  assignedTo?: string;
  approvalStatus: ApprovalStatus;
  locked: boolean;
}

export interface Document {
  id: string;
  customerId: string;
  name: string;
  documentNumber?: string; // New field for document identification
  uploaded: boolean;
  uploadDate?: string;
  notes?: string;
  doneBy?: string;
  submittedTo?: string;
  verified?: boolean;
  verifiedBy?: string;
  status: Status;
  remark?: string;
  startDate?: string;
  endDate?: string;
  fileId?: string;
}

export interface ChecklistItem {
  id: string;
  customerId: string;
  task: string;
  status: Status;
  remark?: string;
  doneBy?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  assignedEmployeeId?: string; // Linked employee ID
  assignedEmployeeName?: string; // For display
}

export interface WiringDetails {
  customerId: string;
  technicianName?: string;
  technicianId?: string; // Linked employee/technician ID
  startDate?: string;
  endDate?: string;
  pvModuleNo?: string;
  aggregateCapacity?: number;
  inverterType?: string;
  acVoltage?: string;
  mountingStructure?: string;
  dcdb?: string;
  acdb?: string;
  cables?: string;
  status: Status;
  remark?: string;
}

export interface Inspection {
  id: string;
  customerId: string;
  document: string;
  submitted: boolean;
  date?: string;
  inwardNo?: string;
  qcName?: string;
  inspectionDate?: string;
  approved: boolean;
  approvalStatus?: "pending" | "approved" | "rejected"; // QC approval status
  approvedBy?: string; // Who approved/rejected
  approvalDate?: string; // When it was approved/rejected
  status: Status;
  remark?: string;
  startDate?: string;
  endDate?: string;
}

// New Connection Section
export interface NewConnection {
  id: string;
  customerId: string;
  documentName: string;
  submitted: boolean;
  uploadDate?: string;
  notes?: string;
  doneBy?: string;
  documentsHandedTo?: string;
  msedclSubmissionDate?: string;
  fileId?: string;
  status: Status;
}

// Sanction Section
export interface Sanction {
  customerId: string;
  sanctionNumber?: string;
  kw?: number;
  date?: string;
  fileId?: string;
  status: Status;
}

// Jansamarth Section
export interface Jansamarth {
  id: string;
  customerId: string;
  documentName: string;
  submitted: boolean;
  documentsHandTo?: string;
  inHandToConsumer: boolean;
  date?: string;
  fileId?: string;
  status: Status;
}

// Completion Report Section
export interface CompletionReport {
  id: string;
  customerId: string;
  documentName: string;
  remark?: string;
  status: Status;
  doneBy?: string;
  date?: string;
  fileId?: string;
}

// RTS Documents Section
export interface RTSDocument {
  id: string;
  customerId: string;
  documentName: string;
  remark?: string;
  uploaded: boolean;
  date?: string;
  fileId?: string;
  status: Status;
}

// Release Order Section
export interface ReleaseOrder {
  customerId: string;
  date?: string;
  number?: string;
  fileId?: string;
  status: Status;
}

// Meter Fitting Section
export interface MeterFitting {
  customerId: string;
  date?: string;
  generationMeterNo?: string;
  adaniMeterNo?: string;
  systemStartDate?: string;
  fileId?: string;
  status: Status;
}

// Commissioning Section (Updated)
export interface Commissioning {
  customerId: string;
  commissioningReportFileId?: string;
  subsidyReceivedDate?: string;
  status: Status;
  remark?: string;
  startDate?: string;
  endDate?: string;
}

export interface Advising {
  id: string;
  customerId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  remark?: string;
  assignedTo?: string;
  status: Status;
  startDate?: string;
  endDate?: string;
}

// Mock employees
export const mockEmployees: Employee[] = [
  {
    id: "emp1",
    name: "Shreya Patil",
    email: "shreya@example.com",
    phone: "9123456780",
    status: "active",
    assignedCustomers: ["1", "2"],
    createdBy: "admin",
    createdDate: "2024-01-10",
  },
  {
    id: "emp2",
    name: "Rahul Deshmukh",
    email: "rahul@example.com",
    phone: "9123456781",
    status: "active",
    assignedCustomers: ["3", "4"],
    createdBy: "admin",
    createdDate: "2024-01-12",
  },
  {
    id: "emp3",
    name: "Priya Joshi",
    email: "priya@example.com",
    phone: "9123456782",
    status: "pending",
    assignedCustomers: [],
    createdBy: "admin",
    createdDate: "2024-03-15",
  },
];

// Mock activity logs
export const mockActivities: ActivityLog[] = [
  {
    id: "act1",
    user: "Shreya Patil",
    userId: "emp1",
    customerId: "1",
    section: "Documents",
    action: "Uploaded Light Bill",
    date: "2024-03-20T14:30:00",
  },
  {
    id: "act2",
    user: "Admin",
    userId: "admin",
    customerId: "1",
    section: "Documents",
    action: "Verified Aadhaar Card",
    date: "2024-03-20T15:45:00",
  },
  {
    id: "act3",
    user: "Rahul Deshmukh",
    userId: "emp2",
    customerId: "3",
    section: "Checklist",
    action: "Completed New Connection",
    date: "2024-03-21T10:15:00",
  },
  {
    id: "act4",
    user: "Shreya Patil",
    userId: "emp1",
    customerId: "2",
    section: "Wiring",
    action: "Updated wiring details",
    date: "2024-03-21T16:20:00",
  },
];

// Mock customers
export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    consumerNumber: "CN001234567",
    mobile: "9876543210",
    address: "123, Green Valley Society, Pune, Maharashtra - 411001",
    systemCapacity: 5.5,
    orderAmount: 325000,
    orderDate: "2024-01-15",
    assignedTo: "emp1",
    approvalStatus: "verified",
    locked: false,
  },
  {
    id: "2",
    name: "Priya Sharma",
    consumerNumber: "CN002345678",
    mobile: "9765432109",
    address: "45, Sunrise Apartments, Mumbai, Maharashtra - 400052",
    systemCapacity: 3.3,
    orderAmount: 195000,
    orderDate: "2024-02-10",
    assignedTo: "emp1",
    approvalStatus: "pending",
    locked: false,
  },
  {
    id: "3",
    name: "Amit Patel",
    consumerNumber: "CN003456789",
    mobile: "9654321098",
    address: "78, Laxmi Nagar, Nagpur, Maharashtra - 440001",
    systemCapacity: 7.2,
    orderAmount: 425000,
    orderDate: "2024-01-28",
    assignedTo: "emp2",
    approvalStatus: "verified",
    locked: false,
  },
  {
    id: "4",
    name: "Sunita Desai",
    consumerNumber: "CN004567890",
    mobile: "9543210987",
    address: "22, Palm Heights, Thane, Maharashtra - 400601",
    systemCapacity: 2.5,
    orderAmount: 145000,
    orderDate: "2024-03-05",
    assignedTo: "emp2",
    approvalStatus: "pending",
    locked: false,
  },
  {
    id: "5",
    name: "Vikram Singh",
    consumerNumber: "CN005678901",
    mobile: "9432109876",
    address: "89, Royal Enclave, Nashik, Maharashtra - 422001",
    systemCapacity: 10.0,
    orderAmount: 580000,
    orderDate: "2024-02-20",
    approvalStatus: "completed",
    locked: true,
  },
  {
    id: "6",
    name: "Meera Iyer",
    consumerNumber: "CN006789012",
    mobile: "9321098765",
    address: "56, Ocean View, Ratnagiri, Maharashtra - 415612",
    systemCapacity: 4.8,
    orderAmount: 285000,
    orderDate: "2024-03-12",
    approvalStatus: "pending",
    locked: false,
  },
];

// Mock documents
export const mockDocuments: Document[] = [
  {
    id: "d1",
    customerId: "1",
    name: "Aadhaar Card",
    uploaded: true,
    uploadDate: "2024-01-16",
    doneBy: "Shreya Patil",
    submittedTo: "MSEDCL",
    verified: true,
    verifiedBy: "Admin",
    status: "completed",
    remark: "Document verified and submitted",
    startDate: "2024-01-15",
    endDate: "2024-01-16",
  },
  {
    id: "d2",
    customerId: "1",
    name: "Light Bill",
    uploaded: true,
    uploadDate: "2024-01-16",
    doneBy: "Shreya Patil",
    submittedTo: "MSEDCL",
    verified: true,
    verifiedBy: "Admin",
    status: "completed",
    remark: "Latest bill submitted",
    startDate: "2024-01-15",
    endDate: "2024-01-16",
  },
  {
    id: "d3",
    customerId: "1",
    name: "7/12 & Index 2",
    uploaded: false,
    status: "pending",
    remark: "Awaiting customer submission",
  },
  {
    id: "d4",
    customerId: "2",
    name: "Aadhaar Card",
    uploaded: true,
    uploadDate: "2024-02-11",
    doneBy: "Admin",
    status: "in_progress",
    remark: "Pending verification",
  },
];

// Mock checklist items
export const mockChecklist: ChecklistItem[] = [
  {
    id: "c1",
    customerId: "1",
    task: "New Connection",
    status: "completed",
    doneBy: "Admin",
    date: "2024-01-18",
    remark: "Connection approved",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
  },
  {
    id: "c2",
    customerId: "1",
    task: "Email & Mobile Update",
    status: "completed",
    doneBy: "Admin",
    date: "2024-01-19",
  },
  {
    id: "c3",
    customerId: "1",
    task: "Load Extension",
    status: "completed",
    doneBy: "Admin",
    date: "2024-01-22",
  },
  {
    id: "c4",
    customerId: "1",
    task: "PV Application",
    status: "completed",
    doneBy: "Admin",
    date: "2024-01-25",
  },
  {
    id: "c5",
    customerId: "1",
    task: "Net Meter Application",
    status: "completed",
    doneBy: "Admin",
    date: "2024-01-30",
  },
  {
    id: "c6",
    customerId: "2",
    task: "New Connection",
    status: "completed",
    doneBy: "Admin",
    date: "2024-02-12",
  },
  {
    id: "c7",
    customerId: "2",
    task: "Email & Mobile Update",
    status: "in_progress",
    doneBy: "Admin",
  },
  {
    id: "c8",
    customerId: "2",
    task: "Load Extension",
    status: "pending",
  },
  {
    id: "c9",
    customerId: "3",
    task: "New Connection",
    status: "pending",
  },
];

// Mock wiring details
export const mockWiring: Record<string, WiringDetails> = {
  "1": {
    customerId: "1",
    technicianName: "Suresh Patil",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    pvModuleNo: "PV550-72-M",
    aggregateCapacity: 5.5,
    inverterType: "String Inverter 5kW",
    acVoltage: "230V",
    mountingStructure: "Galvanized Steel",
    dcdb: "IP65 Enclosure",
    acdb: "IP65 Enclosure",
    cables: "4mm² DC, 6mm² AC",
    status: "completed",
    remark: "Wiring completed as per specifications",
  },
};

// Mock inspections
export const mockInspections: Inspection[] = [
  {
    id: "i1",
    customerId: "1",
    document: "Work Completion Report",
    submitted: true,
    date: "2024-02-08",
    inwardNo: "INW001",
    qcName: "Quality Inspector A",
    inspectionDate: "2024-02-10",
    approved: true,
    status: "completed",
    remark: "Inspection passed successfully",
    startDate: "2024-02-08",
    endDate: "2024-02-10",
  },
];

// Mock commissioning data
export const mockCommissioning: Record<string, Commissioning> = {
  "1": {
    customerId: "1",
    commissioningReportFileId: "cr_file_1",
    subsidyReceivedDate: "2024-02-21",
    status: "completed",
    remark: "System commissioned successfully",
    startDate: "2024-02-15",
    endDate: "2024-02-21",
  },
};

export const mockAdvising: Advising[] = [
  {
    id: "adv1",
    customerId: "2",
    title: "Document Verification Pending",
    description: "Need to verify Aadhaar card and light bill before proceeding",
    priority: "high",
    remark: "Customer requested expedited processing",
    assignedTo: "emp1",
    status: "in_progress",
    startDate: "2024-03-10",
  },
  {
    id: "adv2",
    customerId: "3",
    title: "Technical Site Assessment",
    description: "Conduct roof load bearing assessment for 7.2kW system",
    priority: "medium",
    assignedTo: "emp2",
    status: "pending",
    startDate: "2024-03-15",
  },
];