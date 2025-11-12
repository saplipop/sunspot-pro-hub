import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ListChecks, Eye } from "lucide-react";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { ChecklistItem, Customer } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";

const Checklists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
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
    setChecklists(storage.getChecklist());
    setCustomers(storage.getCustomers());
  };

  const getCustomerName = (customerId: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const getCustomerProgress = (customerId: string): number => {
    const customerChecklists = checklists.filter((c) => c.customerId === customerId);
    if (customerChecklists.length === 0) return 0;
    const completed = customerChecklists.filter((c) => c.status === "completed").length;
    return Math.round((completed / customerChecklists.length) * 100);
  };

  const filteredChecklists = checklists.filter((item) => {
    const customerName = getCustomerName(item.customerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      item.task.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower)
    );
  });

  const completedCount = checklists.filter((c) => c.status === "completed").length;
  const inProgressCount = checklists.filter((c) => c.status === "in_progress").length;
  const pendingCount = checklists.filter((c) => c.status === "pending").length;

  // Group by customer
  const customerGroups = customers.map((customer) => ({
    customer,
    items: checklists.filter((c) => c.customerId === customer.id),
    progress: getCustomerProgress(customer.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Checklists</h2>
        <p className="text-muted-foreground">Track project progress checklists across all customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks or customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer Checklist Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerGroups.filter((g) => g.items.length > 0).map(({ customer, items, progress }) => (
          <Card key={customer.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{customer.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {items.filter((i) => i.status === "completed").length}/{items.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}% Complete</span>
                <span>{items.filter((i) => i.status === "pending").length} Pending</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Checklist Tasks ({filteredChecklists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Done By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <ListChecks className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No checklist items found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredChecklists.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{item.task}</TableCell>
                    <TableCell>{getCustomerName(item.customerId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-sm">{item.doneBy || "-"}</TableCell>
                    <TableCell className="text-sm">{item.date || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/${item.customerId}`)}
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

export default Checklists;
