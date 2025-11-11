export type UserRole = 'admin' | 'employee';

export type ProjectStatus = 'pending' | 'in-progress' | 'completed';
export type DocumentStatus = 'pending' | 'uploaded' | 'verified';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'suspended';
  createdAt: string;
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
  assignedEmployeeId?: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  customerId: string;
  type: string;
  documentNumber?: string;
  status: DocumentStatus;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface NewConnection {
  id: string;
  customerId: string;
  documents: {
    aadhaar: DocumentStatus;
    lightBill: DocumentStatus;
    sevenTwelve: DocumentStatus;
    indexTwo: DocumentStatus;
    undertaking: DocumentStatus;
    notary: DocumentStatus;
  };
  submittedDate?: string;
  doneBy?: string;
  status: ProjectStatus;
}

export interface SolarChecklist {
  id: string;
  customerId: string;
  newConnection: ProjectStatus;
  loadExtension: ProjectStatus;
  pvApplication: ProjectStatus;
  feasibility: ProjectStatus;
  netMeter: ProjectStatus;
  status: ProjectStatus;
}

export interface Sanction {
  id: string;
  customerId: string;
  sanctionNumber?: string;
  sanctionKW?: number;
  sanctionDate?: string;
  status: ProjectStatus;
}

export interface JansamarthDoc {
  type: string;
  submitted: boolean;
  date?: string;
}

export interface Jansamarth {
  id: string;
  customerId: string;
  documents: JansamarthDoc[];
  bankSubmissionDate?: string;
  status: ProjectStatus;
}

export interface CompletionReport {
  id: string;
  customerId: string;
  documents: {
    modelAgreement: DocumentStatus;
    annexureA: DocumentStatus;
    annexureB: DocumentStatus;
    testReport: DocumentStatus;
    singleLineDiagram: DocumentStatus;
    workCompletion: DocumentStatus;
    invoiceWithTax: DocumentStatus;
    invoice: DocumentStatus;
    panCard: DocumentStatus;
    cancelledCheque: DocumentStatus;
    gstCertificate: DocumentStatus;
    inspectionReport: DocumentStatus;
    netMeterPhoto: DocumentStatus;
    plantPhoto: DocumentStatus;
  };
  doneBy?: string;
  completionDate?: string;
  status: ProjectStatus;
}

export interface RTSDocument {
  id: string;
  customerId: string;
  documents: {
    annexure: DocumentStatus;
    declaration: DocumentStatus;
    photo: DocumentStatus;
    approval: DocumentStatus;
  };
  uploadDate?: string;
  status: ProjectStatus;
}

export interface WiringComponent {
  name: string;
  specification: string;
  verified: boolean;
}

export interface WiringStatus {
  id: string;
  customerId: string;
  technicianName?: string;
  startDate?: string;
  endDate?: string;
  components: WiringComponent[];
  status: ProjectStatus;
  remarks?: string;
}

export interface InspectionQC {
  id: string;
  customerId: string;
  documentSubmitted: boolean;
  submissionDate?: string;
  inwardNumber?: string;
  qcName?: string;
  inspectionApproved?: boolean;
  approvalDate?: string;
  status: ProjectStatus;
  remarks?: string;
}

export interface ReleaseOrder {
  id: string;
  customerId: string;
  releaseNumber?: string;
  releaseDate?: string;
  status: ProjectStatus;
}

export interface MeterFitting {
  id: string;
  customerId: string;
  generationMeterNo?: string;
  adaniMeterNo?: string;
  systemStartDate?: string;
  status: ProjectStatus;
}

export interface Commissioning {
  id: string;
  customerId: string;
  commissioningReportUploaded: boolean;
  uploadDate?: string;
  subsidyReceived: boolean;
  subsidyReceivedDate?: string;
  status: ProjectStatus;
}

export interface ActivityLog {
  id: string;
  customerId?: string;
  section: string;
  action: string;
  user: string;
  timestamp: string;
  remarks?: string;
  type: 'manual' | 'auto';
}
