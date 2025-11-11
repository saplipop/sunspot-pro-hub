import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Customer,
  User,
  Document,
  ActivityLog,
  NewConnection,
  SolarChecklist,
  Sanction,
  Jansamarth,
  CompletionReport,
  RTSDocument,
  WiringStatus,
  InspectionQC,
  ReleaseOrder,
  MeterFitting,
  Commissioning,
  ProjectStatus,
} from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  customers: Customer[];
  employees: User[];
  documents: Document[];
  activityLogs: ActivityLog[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addEmployee: (employee: Omit<User, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, updates: Partial<User>) => void;
  addDocument: (doc: Omit<Document, 'id'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  calculateCustomerProgress: (customerId: string) => number;
  getCustomerData: (customerId: string) => any;
  updateCustomerSection: (customerId: string, section: string, data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

const STORAGE_KEYS = {
  CUSTOMERS: 'solarflow_customers',
  EMPLOYEES: 'solarflow_employees',
  DOCUMENTS: 'solarflow_documents',
  LOGS: 'solarflow_logs',
  SECTIONS: 'solarflow_sections',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sections, setSections] = useState<any>({});

  // Load data from localStorage
  useEffect(() => {
    const loadedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const loadedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    const loadedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const loadedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const loadedSections = localStorage.getItem(STORAGE_KEYS.SECTIONS);

    if (loadedCustomers) setCustomers(JSON.parse(loadedCustomers));
    if (loadedEmployees) setEmployees(JSON.parse(loadedEmployees));
    if (loadedDocuments) setDocuments(JSON.parse(loadedDocuments));
    if (loadedLogs) setActivityLogs(JSON.parse(loadedLogs));
    if (loadedSections) setSections(JSON.parse(loadedSections));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  }, [sections]);

  const calculateCustomerProgress = useCallback((customerId: string): number => {
    const customerSections = sections[customerId] || {};
    
    const weights = {
      newConnection: 0.15,
      solarChecklist: 0.10,
      sanction: 0.05,
      jansamarth: 0.10,
      completionReport: 0.15,
      rtsDocument: 0.10,
      wiringStatus: 0.15,
      inspectionQC: 0.10,
      releaseOrder: 0.03,
      meterFitting: 0.05,
      commissioning: 0.02,
    };

    let totalProgress = 0;

    Object.entries(customerSections).forEach(([section, data]: [string, any]) => {
      const weight = weights[section as keyof typeof weights] || 0;
      const sectionStatus = data?.status || 'pending';
      
      let sectionProgress = 0;
      if (sectionStatus === 'completed') sectionProgress = 1;
      else if (sectionStatus === 'in-progress') sectionProgress = 0.5;
      
      totalProgress += sectionProgress * weight;
    });

    return Math.round(totalProgress * 100);
  }, [sections]);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>) => {
    const id = Date.now().toString();
    const newCustomer: Customer = {
      ...customer,
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => [...prev, newCustomer]);

    // Initialize blank sections for new customer
    setSections((prev: any) => ({
      ...prev,
      [id]: {
        newConnection: { status: 'pending', documents: {} },
        solarChecklist: { status: 'pending' },
        sanction: { status: 'pending' },
        jansamarth: { status: 'pending', documents: [] },
        completionReport: { status: 'pending', documents: {} },
        rtsDocument: { status: 'pending', documents: {} },
        wiringStatus: { status: 'pending', components: [] },
        inspectionQC: { status: 'pending' },
        releaseOrder: { status: 'pending' },
        meterFitting: { status: 'pending' },
        commissioning: { status: 'pending' },
      },
    }));

    addActivityLog({
      customerId: id,
      section: 'Customer',
      action: 'Customer created',
      user: 'Admin',
      type: 'manual',
    });

    toast.success('Customer added successfully');
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );

    addActivityLog({
      customerId: id,
      section: 'Customer',
      action: 'Customer updated',
      user: 'Admin',
      type: 'manual',
    });

    toast.success('Customer updated successfully');
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setDocuments((prev) => prev.filter((d) => d.customerId !== id));
    
    addActivityLog({
      customerId: id,
      section: 'Customer',
      action: 'Customer deleted',
      user: 'Admin',
      type: 'manual',
    });

    toast.success('Customer deleted successfully');
  }, []);

  const addEmployee = useCallback((employee: Omit<User, 'id' | 'createdAt'>) => {
    const newEmployee: User = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setEmployees((prev) => [...prev, newEmployee]);

    addActivityLog({
      section: 'Employee',
      action: `Employee ${employee.name} added`,
      user: 'Admin',
      type: 'manual',
    });

    toast.success('Employee added successfully');
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<User>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );

    toast.success('Employee updated successfully');
  }, []);

  const addDocument = useCallback((doc: Omit<Document, 'id'>) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
    };

    setDocuments((prev) => [...prev, newDoc]);

    addActivityLog({
      customerId: doc.customerId,
      section: 'Documents',
      action: `Document ${doc.type} uploaded`,
      user: doc.uploadedBy || 'Unknown',
      type: 'manual',
    });
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const addActivityLog = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setActivityLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  const getCustomerData = useCallback((customerId: string) => {
    return sections[customerId] || {};
  }, [sections]);

  const updateCustomerSection = useCallback((customerId: string, section: string, data: any) => {
    setSections((prev: any) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [section]: data,
      },
    }));

    // Recalculate progress
    setTimeout(() => {
      const progress = calculateCustomerProgress(customerId);
      updateCustomer(customerId, { progress });
    }, 100);

    addActivityLog({
      customerId,
      section,
      action: `${section} updated`,
      user: 'User',
      type: 'manual',
    });
  }, [calculateCustomerProgress, updateCustomer]);

  return (
    <DataContext.Provider
      value={{
        customers,
        employees,
        documents,
        activityLogs,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addEmployee,
        updateEmployee,
        addDocument,
        updateDocument,
        addActivityLog,
        calculateCustomerProgress,
        getCustomerData,
        updateCustomerSection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
