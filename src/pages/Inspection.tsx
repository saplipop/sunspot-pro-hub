import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ClipboardCheck, Eye, CheckCircle, XCircle } from "lucide-react";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { Inspection, Customer } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";

const InspectionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  const loadData = () => {
    setInspections(storage.getInspections());
    setCustomers(storage.getCustomers());
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const filteredInspections = inspections.filter((inspection) => {
    const customerName = getCustomerName(inspection.customerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      inspection.document.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      (inspection.qcName && inspection.qcName.toLowerCase().includes(searchLower))
    );
  });

  const approvedCount = inspections.filter((i) => i.approved && i.status === "completed").length;
  const pendingCount = inspections.filter((i) => !i.approved && i.status === "pending").length;
  const submittedCount = inspections.filter((i) => i.submitted).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">QC / Inspection</h2>
        <p className="text-muted-foreground">Quality control and inspection management across all customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inspections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              {approvedCount}
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center gap-2">
              {pendingCount}
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{submittedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inspections, customers, or QC names..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Inspections ({filteredInspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>QC Name</TableHead>
                <TableHead>Inspection Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No inspections found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        {inspection.document}
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(inspection.customerId)}</TableCell>
                    <TableCell className="text-sm">{inspection.qcName || "-"}</TableCell>
                    <TableCell className="text-sm">{inspection.inspectionDate || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={inspection.status} />
                    </TableCell>
                    <TableCell>
                      {inspection.approved ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : inspection.submitted ? (
                        <Badge className="bg-warning text-warning-foreground">
                          Pending Review
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not Submitted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/${inspection.customerId}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionPage;
