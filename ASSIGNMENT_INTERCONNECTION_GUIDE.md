# Employee Assignment Interconnection System

## Overview
This system automatically interconnects employee assignments across all sections of a customer project in real-time. When you assign an employee to a customer, all related sections (wiring, inspection, commissioning, checklist) are automatically updated and synchronized.

## How It Works

### 1. Centralized Assignment Manager
**File:** `src/lib/employeeAssignmentManager.ts`

The `EmployeeAssignmentManager` class handles all employee assignments in a centralized way:

- **`assignEmployee()`** - Assigns an employee and updates all related sections
- **`unassignEmployee()`** - Removes an employee and resets all sections
- **`reassignEmployee()`** - Switches employees seamlessly
- **`getCustomerAssignmentStatus()`** - Gets real-time status of all assignments

### 2. Real-Time Synchronization
**Hook:** `src/hooks/useEmployeeSync.ts`

This hook monitors the assignment status in real-time:
```typescript
const assignmentStatus = useEmployeeSync(customerId);
// Returns: {
//   hasCustomerAssignment: boolean,
//   hasWiringAssignment: boolean,
//   hasInspectionAssignment: boolean,
//   hasCommissioningAssignment: boolean,
//   hasChecklistAssignment: boolean,
//   assignedEmployee: string
// }
```

### 3. Visual Status Indicator
**Component:** `src/components/AssignmentStatusIndicator.tsx`

Shows the real-time interconnection status with:
- Color-coded section status (green = connected, gray = pending)
- Live sync animation when data updates
- Employee information and project count
- Connection status badges

### 4. Automatic Notifications
**Hook:** `src/hooks/useAssignmentNotifications.ts`

Automatically shows toast notifications when:
- An employee is assigned to multiple sections
- Sections are synchronized
- Assignments are updated

## Usage

### Assigning an Employee

```typescript
import { employeeAssignmentManager } from "@/lib/employeeAssignmentManager";

// Assign to all sections
employeeAssignmentManager.assignEmployee({
  customerId: "customer123",
  employeeId: "emp456",
  employeeName: "John Doe",
  sections: {
    customer: true,
    wiring: true,
    inspection: true,
    commissioning: true,
    checklist: true,
  },
  dates: {
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  notes: "High priority project",
});
```

### What Gets Updated Automatically

1. **Customer Record** - `assignedTo` field updated
2. **Employee Record** - `assignedCustomers` array updated
3. **Wiring Section** - `technicianId` and `technicianName` set, status → "in_progress"
4. **Checklist Items** - All pending items get `assignedEmployeeId` and `assignedEmployeeName`
5. **Inspection Records** - `qcName` set, status → "in_progress"
6. **Commissioning** - Status → "in_progress", dates and notes added
7. **Activity Log** - Automatic activity entry created

### Storage Events

All updates trigger the `STORAGE_CHANGE_EVENT` which causes:
- All components to re-render with fresh data
- Real-time sync across all open tabs/windows
- Visual indicators to update
- Notifications to appear

## Components Using Interconnection

### 1. EmployeeAssignment Component
- Uses `employeeAssignmentManager.assignEmployee()`
- Updates all sections when assigning
- Shows success notification with all connected sections

### 2. WorkAssignmentPanel Component
- Uses `employeeAssignmentManager.assignEmployee()` with specific sections
- Supports date ranges and notes
- Shows workload balance

### 3. CustomerDetail Page
- Displays `AssignmentStatusIndicator`
- Uses `useEmployeeSync()` for real-time status
- Uses `useAssignmentNotifications()` for updates

## Real-Time Features

### Automatic Synchronization
- When employee assigned → all sections update immediately
- When section status changes → all components refresh
- When employee suspended → assignments cleared automatically

### Visual Feedback
- Pulse animation on sync
- Color-coded status badges
- Connection status counter
- Live employee information

### Cross-Tab Sync
- Changes in one tab reflect in all open tabs
- Uses browser's `CustomEvent` API
- No server polling required

## Benefits

1. **No Manual Updates** - Assign once, everything updates
2. **Real-Time Consistency** - All sections always in sync
3. **Visual Feedback** - See exactly what's connected
4. **Audit Trail** - Automatic activity logging
5. **Error Prevention** - Centralized logic prevents inconsistencies

## Future Enhancements

- [ ] Batch assignment for multiple customers
- [ ] Assignment scheduling/calendar
- [ ] Workload rebalancing suggestions
- [ ] Email notifications on assignment
- [ ] Mobile push notifications
- [ ] Assignment history timeline
- [ ] Performance analytics per employee
