import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Document,
  ChecklistItem,
  WiringDetails,
  Inspection,
  Commissioning,
  Advising,
} from "@/data/mockData";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { dataManager } from "@/lib/dataManager";
import { calculateOverallProgress } from "@/lib/progressCalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Edit, Plus, AlertCircle, FileText, ListChecks, Cable, ClipboardCheck, Zap } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { exportCustomerReport } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { DocumentTabs } from "@/components/DocumentTabs";
import { ProgressPanel } from "@/components/ProgressPanel";
import { EmployeeAssignment } from "@/components/EmployeeAssignment";
import { ChecklistEditModal } from "@/components/ChecklistEditModal";
import { WiringEditModal } from "@/components/WiringEditModal";
import { InspectionEditModal } from "@/components/InspectionEditModal";
import { CommissioningEditModal } from "@/components/CommissioningEditModal";
import { AdvisingModal } from "@/components/AdvisingModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(id ? storage.getCustomer(id) : undefined);

  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [wiring, setWiring] = useState<WiringDetails | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [commissioning, setCommissioning] = useState<Commissioning | null>(null);
  const [advisings, setAdvisings] = useState<Advising[]>([]);
  const [progress, setProgress] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal states
  const [checklistModal, setChecklistModal] = useState<{ open: boolean; item: ChecklistItem | null }>({
    open: false,
    item: null,
  });
  const [wiringModal, setWiringModal] = useState(false);
  const [inspectionModal, setInspectionModal] = useState<{ open: boolean; inspection: Inspection | null }>({
    open: false,
    inspection: null,
  });
  const [commissioningModal, setCommissioningModal] = useState(false);
  const [advisingModal, setAdvisingModal] = useState<{ open: boolean; advising: Advising | null }>({
    open: false,
    advising: null,
  });

  // Load data from storage
  const loadData = () => {
    if (id) {
      setCustomer(storage.getCustomer(id));
      setDocuments(storage.getCustomerDocuments(id));
      setChecklist(storage.getCustomerChecklist(id));
      setWiring(storage.getCustomerWiring(id) || null);
      setInspections(storage.getCustomerInspections(id));
      setCommissioning(storage.getCustomerCommissioning(id) || null);
      setProgress(calculateOverallProgress(id));
    }
  };

  useEffect(() => {
    loadData();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadData();
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [id]);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Customer not found</p>
        <Button onClick={() => navigate("/customers")} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  const handleEmployeeAssignment = (employeeId: string) => {
    toast({
      title: "Employee Assigned",
      description: "The employee has been successfully assigned to this project",
    });
  };

  const handleDocumentSave = (doc: Document) => {
    storage.updateDocument(doc);
    if (id) {
      dataManager.recalculateProgress(id);
    }
    toast({
      title: "Document Updated",
      description: `${doc.name} has been updated`,
    });
  };

  const handleChecklistSave = (item: ChecklistItem) => {
    if (id) {
      dataManager.updateChecklistItem(item, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Checklist Updated",
        description: `${item.task} has been updated`,
      });
    }
  };

  const handleWiringSave = (wiringData: WiringDetails) => {
    if (id) {
      dataManager.updateWiring(id, wiringData, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Wiring Updated",
        description: "Wiring details have been updated",
      });
    }
  };

  const handleInspectionSave = (inspection: Inspection) => {
    dataManager.updateInspection(inspection, user?.username || "Admin", user?.username || "admin");
    toast({
      title: "Inspection Updated",
      description: `${inspection.document} has been updated`,
    });
  };

  const handleCommissioningSave = (commissioningData: Commissioning) => {
    if (id) {
      dataManager.updateCommissioning(id, commissioningData, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Commissioning Updated",
        description: "Commissioning details have been updated",
      });
    }
  };

  const handleAdvisingSave = (advising: Advising) => {
    // Placeholder for advising functionality
    toast({
      title: "Advising Updated",
      description: "Advising details have been saved",
    });
  };

  const handleExportReport = () => {
    exportCustomerReport(customer);
    toast({
      title: "Report Exported",
      description: "Customer report downloaded successfully",
    });
  };

  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    const colors = {
      low: "bg-muted text-muted-foreground",
      medium: "bg-warning text-warning-foreground",
      high: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={colors[priority]}>{priority.toUpperCase()}</Badge>;
  };

  // Helper to get section status
  const getSectionStatus = (progress: number): "pending" | "in_progress" | "completed" => {
    if (progress === 100) return "completed";
    if (progress > 0) return "in_progress";
    return "pending";
  };

  // Calculate section progress for ProgressPanel
  const docProgress = documents.length > 0 ? Math.round((documents.filter(d => d.fileId || d.uploaded).length / documents.length) * 100) : 0;
  const checkProgress = checklist.length > 0 ? Math.round((checklist.filter(c => c.status === "completed").length / checklist.length) * 100) : 0;
  const wireProgress = wiring?.status === "completed" ? 100 : wiring?.status === "in_progress" ? 50 : 0;
  const inspProgress = inspections.length > 0 ? Math.round((inspections.filter(i => i.status === "completed").length / inspections.length) * 100) : 0;
  const commProgress = commissioning?.status === "completed" ? 100 : commissioning?.status === "in_progress" ? 50 : 0;

  const sectionProgress = [
    {
      name: "Documents",
      progress: docProgress,
      icon: FileText,
      status: getSectionStatus(docProgress),
    },
    {
      name: "Checklist",
      progress: checkProgress,
      icon: ListChecks,
      status: getSectionStatus(checkProgress),
    },
    {
      name: "Wiring",
      progress: wireProgress,
      icon: Cable,
      status: wiring?.status || "pending",
    },
    {
      name: "Inspection",
      progress: inspProgress,
      icon: ClipboardCheck,
      status: getSectionStatus(inspProgress),
    },
    {
      name: "Commissioning",
      progress: commProgress,
      icon: Zap,
      status: commissioning?.status || "pending",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">{customer.name}</h2>
            <p className="text-muted-foreground">{customer.consumerNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <EmployeeAssignment
              customerId={customer.id}
              customerName={customer.name}
              currentAssignee={customer.assignedTo}
              onAssign={handleEmployeeAssignment}
            />
          )}
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="font-medium">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Capacity</p>
              <p className="font-medium">{customer.systemCapacity} kW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Amount</p>
              <p className="font-medium">₹{customer.orderAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{new Date(customer.orderDate).toLocaleDateString()}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{customer.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="wiring">Wiring</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
              <TabsTrigger value="commissioning">Commissioning</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentTabs
                documents={documents}
                onDocumentUpdate={handleDocumentSave}
              />
            </TabsContent>

            {/* Checklist Tab */}
            <TabsContent value="checklist">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Process Checklist</CardTitle>
                    <div className="flex gap-2 text-sm">
                      <Badge className="bg-success text-success-foreground">
                        ✓ {checklist.filter((c) => c.status === "completed").length}
                      </Badge>
                      <Badge variant="outline">
                        ⏳ {checklist.filter((c) => c.status === "pending").length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress
                      value={
                        checklist.length > 0
                          ? (checklist.filter((c) => c.status === "completed").length / checklist.length) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Done By</TableHead>
                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checklist.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.task}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>{item.doneBy || "-"}</TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChecklistModal({ open: true, item })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wiring Tab */}
            <TabsContent value="wiring">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Wiring Details</CardTitle>
                    {isAdmin && wiring && (
                      <Button variant="outline" size="sm" onClick={() => setWiringModal(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {wiring ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <StatusBadge status={wiring.status} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Technician</p>
                          <p className="font-medium">{wiring.technicianName || "-"}</p>
                        </div>
                      </div>
                      {wiring.remark && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Remark:</p>
                          <p className="text-sm">{wiring.remark}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No wiring details available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inspection Tab */}
            <TabsContent value="inspection">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection QC</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Status</TableHead>
                        {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.document}</TableCell>
                          <TableCell>
                            <StatusBadge status={inspection.status} />
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInspectionModal({ open: true, inspection })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Commissioning Tab */}
            <TabsContent value="commissioning">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Commissioning</CardTitle>
                    {isAdmin && commissioning && (
                      <Button variant="outline" size="sm" onClick={() => setCommissioningModal(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {commissioning ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <StatusBadge status={commissioning.status} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subsidy Received</p>
                          <p className="font-medium">{commissioning.subsidyReceivedDate || "-"}</p>
                        </div>
                      </div>
                      {commissioning.commissioningReportFileId && (
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Commissioning Report Uploaded</p>
                          <Badge variant="outline" className="bg-success/10 text-success">✓ Uploaded</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No commissioning data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storage.getCustomerActivities(id || "").slice(0, 50).map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="text-sm">
                            {new Date(activity.date).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{activity.user}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{activity.section}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{activity.action}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {storage.getCustomerActivities(id || "").length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No activities recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Progress Panel Sidebar */}
        <div className="lg:col-span-1">
          <ProgressPanel sections={sectionProgress} overallProgress={progress} />
        </div>
      </div>

      {/* Modals */}
      {isAdmin && (
        <>
          <ChecklistEditModal
            item={checklistModal.item}
            open={checklistModal.open}
            onOpenChange={(open) => setChecklistModal({ open, item: null })}
            onSave={handleChecklistSave}
          />
          {wiring && (
            <WiringEditModal
              wiring={wiring}
              open={wiringModal}
              onOpenChange={setWiringModal}
              onSave={handleWiringSave}
            />
          )}
          <InspectionEditModal
            inspection={inspectionModal.inspection}
            open={inspectionModal.open}
            onOpenChange={(open) => setInspectionModal({ open, inspection: null })}
            onSave={handleInspectionSave}
          />
          {commissioning && (
            <CommissioningEditModal
              commissioning={commissioning}
              open={commissioningModal}
              onOpenChange={setCommissioningModal}
              onSave={handleCommissioningSave}
            />
          )}
          <AdvisingModal
            advising={advisingModal.advising}
            customerId={id!}
            open={advisingModal.open}
            onOpenChange={(open) => setAdvisingModal({ open, advising: null })}
            onSave={handleAdvisingSave}
          />
        </>
      )}
    </div>
  );
};

export default CustomerDetail;