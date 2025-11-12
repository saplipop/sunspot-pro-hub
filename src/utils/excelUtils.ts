import * as XLSX from 'xlsx';
import { Customer } from '@/data/mockData';

export const downloadExcelTemplate = () => {
  const template = [
    {
      'Customer Name': 'John Doe',
      'Consumer Number': 'CON12345',
      'Mobile': '9876543210',
      'Address': '123 Main Street, City, State - 400001',
      'System Capacity (kW)': '5.5',
      'Order Amount (₹)': '350000',
      'Order Date': '2024-01-15',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customer Template');

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Name
    { wch: 15 }, // Consumer Number
    { wch: 15 }, // Mobile
    { wch: 40 }, // Address
    { wch: 18 }, // System Capacity
    { wch: 18 }, // Order Amount
    { wch: 15 }, // Order Date
  ];

  XLSX.writeFile(wb, 'customer_import_template.xlsx');
};

export const importExcelFile = (file: File): Promise<Partial<Customer>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const customers: Partial<Customer>[] = jsonData.map((row: any) => ({
          id: `CUST${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: row['Customer Name'] || row['name'] || '',
          consumerNumber: row['Consumer Number'] || row['consumerNumber'] || '',
          mobile: row['Mobile'] || row['mobile'] || '',
          address: row['Address'] || row['address'] || '',
          systemCapacity: parseFloat(row['System Capacity (kW)'] || row['systemCapacity'] || '0'),
          orderAmount: parseFloat(row['Order Amount (₹)'] || row['orderAmount'] || '0'),
          orderDate: row['Order Date'] || row['orderDate'] || new Date().toISOString().split('T')[0],
          assignedTo: null,
          approvalStatus: 'pending',
          locked: false,
        }));

        resolve(customers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};