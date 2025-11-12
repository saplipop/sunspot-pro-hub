# Solar Project Management System - API Documentation

## Base URL
```
https://api.solarproject.com/v1
```

## Authentication
All API requests require Bearer token authentication:
```
Authorization: Bearer {access_token}
```

---

## 📊 1. Authentication APIs

### 1.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "fullName": "string",
      "role": "admin | employee",
      "email": "string"
    },
    "token": "string",
    "refreshToken": "string"
  }
}
```

### 1.2 Logout
**POST** `/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.3 Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

---

## 👥 2. Customer Management APIs

### 2.1 Get All Customers
**GET** `/customers`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string
- `status`: "pending" | "in_progress" | "completed"
- `sort`: "name" | "date" | "progress"

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "consumerNo": "string",
        "systemCapacity": "string",
        "sanctionLoad": "string",
        "status": "pending | in_progress | completed",
        "progress": 0-100,
        "createdAt": "ISO 8601 date",
        "updatedAt": "ISO 8601 date"
      }
    ],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 10,
      "totalPages": 0
    }
  }
}
```

### 2.2 Get Customer by ID
**GET** `/customers/{customerId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "consumerNo": "string",
      "systemCapacity": "string",
      "sanctionLoad": "string",
      "status": "string",
      "progress": 0,
      "assignedTo": "string",
      "createdAt": "ISO 8601 date"
    }
  }
}
```

### 2.3 Create Customer
**POST** `/customers`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "consumerNo": "string",
  "systemCapacity": "string",
  "sanctionLoad": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": { /* customer object */ }
  },
  "message": "Customer created successfully"
}
```

### 2.4 Update Customer
**PUT** `/customers/{customerId}`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "consumerNo": "string",
  "systemCapacity": "string",
  "sanctionLoad": "string"
}
```

### 2.5 Delete Customer
**DELETE** `/customers/{customerId}`

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## 📄 3. Document Management APIs

### 3.1 Get Customer Documents
**GET** `/customers/{customerId}/documents`

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "string",
        "customerId": "string",
        "name": "string",
        "documentNumber": "string",
        "uploaded": true,
        "fileId": "string",
        "uploadDate": "ISO 8601 date",
        "status": "pending | in_progress | completed",
        "verified": false,
        "doneBy": "string",
        "startDate": "string",
        "endDate": "string",
        "submittedTo": "string",
        "remark": "string",
        "notes": "string"
      }
    ]
  }
}
```

### 3.2 Update Document
**PUT** `/customers/{customerId}/documents/{documentId}`

**Request Body:**
```json
{
  "documentNumber": "string",
  "status": "pending | in_progress | completed",
  "verified": false,
  "startDate": "string",
  "endDate": "string",
  "submittedTo": "string",
  "remark": "string",
  "notes": "string"
}
```

### 3.3 Upload Document File
**POST** `/customers/{customerId}/documents/{documentId}/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (PDF, JPG, PNG, DOCX - max 5MB)
- `documentNumber`: string (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "string",
    "fileName": "string",
    "fileUrl": "string",
    "uploadDate": "ISO 8601 date"
  }
}
```

### 3.4 Download Document
**GET** `/files/{fileId}`

**Response:** Binary file stream

### 3.5 Delete Document File
**DELETE** `/customers/{customerId}/documents/{documentId}/file`

---

## ✅ 4. Checklist APIs

### 4.1 Get Customer Checklist
**GET** `/customers/{customerId}/checklist`

**Response:**
```json
{
  "success": true,
  "data": {
    "checklist": [
      {
        "id": "string",
        "customerId": "string",
        "item": "string",
        "status": "pending | in_progress | completed",
        "doneBy": "string",
        "doneDate": "ISO 8601 date",
        "assignedEmployeeId": "string",
        "assignedEmployeeName": "string",
        "remarks": "string"
      }
    ]
  }
}
```

### 4.2 Update Checklist Item
**PUT** `/customers/{customerId}/checklist/{itemId}`

**Request Body:**
```json
{
  "status": "pending | in_progress | completed",
  "remarks": "string"
}
```

---

## 🔌 5. Wiring Section APIs

### 5.1 Get Customer Wiring Details
**GET** `/customers/{customerId}/wiring`

**Response:**
```json
{
  "success": true,
  "data": {
    "wiring": {
      "id": "string",
      "customerId": "string",
      "technicianId": "string",
      "technicianName": "string",
      "startDate": "string",
      "endDate": "string",
      "status": "pending | in_progress | completed",
      "components": [
        {
          "name": "string",
          "status": "pending | in_progress | completed"
        }
      ],
      "notes": "string",
      "doneBy": "string",
      "syncedWithTask": true
    }
  }
}
```

### 5.2 Update Wiring Details
**PUT** `/customers/{customerId}/wiring`

**Request Body:**
```json
{
  "status": "pending | in_progress | completed",
  "components": [
    {
      "name": "string",
      "status": "pending | in_progress | completed"
    }
  ],
  "notes": "string"
}
```

---

## 🔍 6. Inspection APIs

### 6.1 Get Customer Inspections
**GET** `/customers/{customerId}/inspections`

**Response:**
```json
{
  "success": true,
  "data": {
    "inspections": [
      {
        "id": "string",
        "customerId": "string",
        "documentName": "string",
        "submitted": false,
        "submissionDate": "string",
        "inwardNo": "string",
        "qcName": "string",
        "inspectionDate": "string",
        "approvalStatus": "pending_review | approved | rejected",
        "approvedBy": "string",
        "approvalDate": "string",
        "status": "pending | in_progress | completed",
        "remarks": "string"
      }
    ]
  }
}
```

### 6.2 Update Inspection
**PUT** `/customers/{customerId}/inspections/{inspectionId}`

**Request Body:**
```json
{
  "submitted": true,
  "submissionDate": "string",
  "inwardNo": "string",
  "qcName": "string",
  "inspectionDate": "string",
  "approvalStatus": "pending_review | approved | rejected",
  "status": "pending | in_progress | completed",
  "remarks": "string"
}
```

---

## ⚙️ 7. Commissioning APIs

### 7.1 Get Customer Commissioning
**GET** `/customers/{customerId}/commissioning`

**Response:**
```json
{
  "success": true,
  "data": {
    "commissioning": {
      "id": "string",
      "customerId": "string",
      "commissioningDate": "string",
      "subsidyReceivedDate": "string",
      "status": "pending | in_progress | completed",
      "remarks": "string",
      "doneBy": "string",
      "autoFetchedData": {
        "customerName": "string",
        "consumerNo": "string",
        "systemCapacity": "string",
        "documentsStatus": "string",
        "wiringStatus": "string",
        "qcApprovalStatus": "string",
        "latestInspectionDate": "string"
      }
    }
  }
}
```

### 7.2 Update Commissioning
**PUT** `/customers/{customerId}/commissioning`

**Request Body:**
```json
{
  "commissioningDate": "string",
  "subsidyReceivedDate": "string",
  "status": "pending | in_progress | completed",
  "remarks": "string"
}
```

---

## 👷 8. Employee Management APIs

### 8.1 Get All Employees
**GET** `/employees`

**Query Parameters:**
- `status`: "active" | "suspended"
- `role`: "admin" | "technician" | "supervisor"

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "string",
        "username": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "role": "admin | employee",
        "designation": "string",
        "status": "active | suspended",
        "assignedTasksCount": 0,
        "createdAt": "ISO 8601 date"
      }
    ]
  }
}
```

### 8.2 Get Employee by ID
**GET** `/employees/{employeeId}`

### 8.3 Create Employee
**POST** `/employees`

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "admin | employee",
  "designation": "string"
}
```

### 8.4 Update Employee
**PUT** `/employees/{employeeId}`

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "designation": "string"
}
```

### 8.5 Suspend Employee
**POST** `/employees/{employeeId}/suspend`

**Response:**
```json
{
  "success": true,
  "message": "Employee suspended successfully",
  "data": {
    "affectedTasks": 5
  }
}
```

### 8.6 Unsuspend Employee
**POST** `/employees/{employeeId}/unsuspend`

---

## 📋 9. Task Assignment APIs

### 9.1 Get All Tasks
**GET** `/tasks`

**Query Parameters:**
- `employeeId`: string
- `customerId`: string
- `status`: "pending" | "in_progress" | "completed" | "pending_reassign"

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "string",
        "customerId": "string",
        "customerName": "string",
        "assignedTo": "string",
        "assignedToName": "string",
        "role": "technician | supervisor",
        "description": "string",
        "startDate": "string",
        "endDate": "string",
        "status": "pending | in_progress | completed | pending_reassign",
        "priority": "low | medium | high",
        "createdDate": "ISO 8601 date",
        "completedDate": "ISO 8601 date"
      }
    ]
  }
}
```

### 9.2 Create Task
**POST** `/tasks`

**Request Body:**
```json
{
  "customerId": "string",
  "assignedTo": "string",
  "role": "technician | supervisor",
  "description": "string",
  "startDate": "string",
  "endDate": "string",
  "priority": "low | medium | high"
}
```

### 9.3 Update Task
**PUT** `/tasks/{taskId}`

**Request Body:**
```json
{
  "assignedTo": "string",
  "description": "string",
  "startDate": "string",
  "endDate": "string",
  "status": "pending | in_progress | completed",
  "priority": "low | medium | high"
}
```

### 9.4 Check Task Deadlines
**GET** `/tasks/deadlines`

**Response:**
```json
{
  "success": true,
  "data": {
    "nearDeadline": [
      {
        "taskId": "string",
        "customerName": "string",
        "assignedToName": "string",
        "endDate": "string",
        "daysRemaining": 2
      }
    ],
    "overdue": [
      {
        "taskId": "string",
        "customerName": "string",
        "assignedToName": "string",
        "endDate": "string",
        "daysOverdue": 3
      }
    ]
  }
}
```

### 9.5 Extend Task Deadline
**POST** `/tasks/{taskId}/extend`

**Request Body:**
```json
{
  "newEndDate": "string",
  "reason": "string"
}
```

---

## 📊 10. Dashboard & Analytics APIs

### 10.1 Get Dashboard Statistics
**GET** `/dashboard/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 0,
    "activeProjects": 0,
    "completedProjects": 0,
    "pendingProjects": 0,
    "totalEmployees": 0,
    "activeEmployees": 0,
    "suspendedEmployees": 0,
    "tasksAssigned": 0,
    "tasksInProgress": 0,
    "tasksCompleted": 0,
    "qcPending": 0,
    "commissioningCompleted": 0
  }
}
```

### 10.2 Get Progress Analytics
**GET** `/dashboard/progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "overallProgress": 0,
    "sectionProgress": {
      "documents": 0,
      "checklist": 0,
      "wiring": 0,
      "inspection": 0,
      "commissioning": 0
    },
    "progressTrend": [
      {
        "date": "string",
        "progress": 0
      }
    ]
  }
}
```

---

## 📝 11. Activity Log APIs

### 11.1 Get Activity Logs
**GET** `/activity-logs`

**Query Parameters:**
- `customerId`: string
- `userId`: string
- `section`: string
- `limit`: number (default: 50)
- `page`: number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "string",
        "user": "string",
        "userId": "string",
        "customerId": "string",
        "section": "string",
        "action": "string",
        "date": "ISO 8601 date"
      }
    ],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 50
    }
  }
}
```

### 11.2 Get Customer Activity Logs
**GET** `/customers/{customerId}/activity-logs`

### 11.3 Get Employee Activity Logs
**GET** `/employees/{employeeId}/activity-logs`

---

## 📤 12. Export APIs

### 12.1 Export Customers to Excel
**GET** `/export/customers`

**Query Parameters:**
- `status`: "pending" | "in_progress" | "completed"
- `format`: "xlsx" | "csv"

**Response:** Binary file stream (Excel/CSV)

### 12.2 Export Customer Details
**GET** `/export/customers/{customerId}`

**Response:** Binary file stream (PDF/Excel)

### 12.3 Export Activity Logs
**GET** `/export/activity-logs`

---

## 📥 13. Import APIs

### 13.1 Import Customers from Excel
**POST** `/import/customers`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (XLSX)

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "failed": 0,
    "errors": []
  }
}
```

---

## 🔔 14. Notification APIs

### 14.1 Get Notifications
**GET** `/notifications`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "deadline | task_assigned | qc_approval",
        "title": "string",
        "message": "string",
        "read": false,
        "createdAt": "ISO 8601 date"
      }
    ]
  }
}
```

### 14.2 Mark Notification as Read
**PUT** `/notifications/{notificationId}/read`

---

## 📊 15. Progress Calculation API

### 15.1 Calculate Customer Progress
**GET** `/customers/{customerId}/progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "overallProgress": 0,
    "sections": {
      "documents": {
        "progress": 0,
        "weight": 25,
        "contribution": 0
      },
      "checklist": {
        "progress": 0,
        "weight": 20,
        "contribution": 0
      },
      "wiring": {
        "progress": 0,
        "weight": 20,
        "contribution": 0
      },
      "inspection": {
        "progress": 0,
        "weight": 20,
        "contribution": 0
      },
      "commissioning": {
        "progress": 0,
        "weight": 15,
        "contribution": 0
      }
    }
  }
}
```

### 15.2 Recalculate All Progress
**POST** `/progress/recalculate`

**Response:**
```json
{
  "success": true,
  "message": "Progress recalculated for all customers",
  "data": {
    "customersUpdated": 0
  }
}
```

---

## ⚠️ Error Responses

All APIs follow standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `DUPLICATE_ENTRY` (409): Resource already exists
- `SERVER_ERROR` (500): Internal server error

---

## 🔐 Security & Rate Limiting

### Rate Limits:
- **Standard endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Export endpoints**: 5 requests per minute

### Security Headers:
All requests should include:
```
Authorization: Bearer {token}
Content-Type: application/json
X-API-Version: 1.0
```

---

## 📝 Notes for Implementation

1. **File Storage**: All uploaded files should be stored securely with unique IDs
2. **Real-time Updates**: Consider WebSocket connections for live updates
3. **Caching**: Implement caching for frequently accessed data (dashboard stats, customer lists)
4. **Pagination**: All list endpoints support pagination
5. **Filtering & Sorting**: Most GET endpoints support query parameters for filtering
6. **Audit Trail**: All modifications are logged in activity logs
7. **Data Validation**: Server-side validation for all input data
8. **Transaction Safety**: Database transactions for multi-step operations (e.g., creating customer + initializing sections)

---

## 🚀 Future API Enhancements

- **Webhooks**: For external integrations
- **Bulk Operations**: Batch updates for multiple customers/tasks
- **Advanced Analytics**: More detailed reporting endpoints
- **Mobile Push Notifications**: Integration with FCM/APNS
- **Document OCR**: Auto-extract document numbers from uploaded files
- **WhatsApp Integration**: Send notifications via WhatsApp API

---
