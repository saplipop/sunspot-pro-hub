import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Download, Filter, Trash2 } from "lucide-react";
import { CustomerModal } from "@/components/CustomerModal";
import { ExcelImport } from "@/components/ExcelImport";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { calculateOverallProgress } from "@/lib/progressCalculator";
import { dataManager } from "@/lib/dataManager";
import { exportToExcel } from "@/utils/exportUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    loadCustomers();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadCustomers();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  const loadCustomers = () => {
    setCustomers(storage.getCustomers());
  };


  const handleImportComplete = (importedCustomers: Partial<Customer>[]) => {
    const count = dataManager.importCustomers(importedCustomers, user?.username || "Admin", user?.username || "admin");
    toast({
      title: "Import Complete",
      description: `${count} customer(s) added successfully`,
    });
  };

  // Calculate progress for each customer
  const customersWithProgress = customers.map((customer) => ({
    ...customer,
    progress: calculateOverallProgress(customer.id),
  }));

  // Apply filters
  let filteredCustomers = customersWithProgress.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.consumerNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && customer.progress === 0) ||
      (filterStatus === "in_progress" && customer.progress > 0 && customer.progress < 100) ||
      (filterStatus === "completed" && customer.progress === 100);

    return matchesSearch && matchesStatus;
  });

  // Sort customers
  filteredCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case "capacity":
        return b.systemCapacity - a.systemCapacity;
      case "amount":
        return b.orderAmount - a.orderAmount;
      case "progress":
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        // Update existing
        const updated: Customer = { ...selectedCustomer, ...customerData };
        dataManager.updateCustomer(updated, user?.username || "Admin", user?.username || "admin");
        toast({
          title: "Customer Updated",
          description: `${customerData.name} has been updated successfully`,
        });
      } else {
        // Add new
        const newCustomer: Customer = {
          id: `CUST${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: customerData.name || "",
          consumerNumber: customerData.consumerNumber || "",
          mobile: customerData.mobile || "",
          address: customerData.address || "",
          systemCapacity: customerData.systemCapacity || 0,
          orderAmount: customerData.orderAmount || 0,
          orderDate: customerData.orderDate || new Date().toISOString().split("T")[0],
          approvalStatus: "pending",
          locked: false,
        };
        dataManager.addCustomer(newCustomer, user?.username || "Admin", user?.username || "admin");
        toast({
          title: "Customer Added",
          description: `${customerData.name} has been added successfully`,
        });
      }
      setModalOpen(false);
      setSelectedCustomer(undefined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      dataManager.deleteCustomer(customerToDelete, user?.username || "Admin", user?.username || "admin");
      toast({
        title: "Customer Deleted",
        description: "Customer and all related data have been removed",
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleExport = () => {
    exportToExcel(filteredCustomers);
    toast({
      title: "Export Complete",
      description: "Customer data exported to Excel",
    });
  };

  const getProgressBadge = (progress: number) => {
    if (progress === 100)
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    if (progress > 0)
      return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Pending</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Customers</h1>
          <p className="text-muted-foreground text-lg">
            Manage all customer information • {filteredCustomers.length} total
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {isAdmin && (
            <>
              <ExcelImport onImportComplete={handleImportComplete} />
              <Button onClick={() => setModalOpen(true)} className="shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or consumer number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="date">Date (Newest First)</SelectItem>
                <SelectItem value="capacity">Capacity (High to Low)</SelectItem>
                <SelectItem value="amount">Amount (High to Low)</SelectItem>
                <SelectItem value="progress">Progress (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover-lift cursor-pointer group border-2 hover:border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="text-lg truncate">{customer.name}</span>
                {getProgressBadge(customer.progress)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Consumer No:</span>
                  <span className="font-medium">{customer.consumerNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mobile:</span>
                  <span className="font-medium">{customer.mobile}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="font-semibold text-secondary">{customer.systemCapacity} kW</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Amount:</span>
                  <span className="font-semibold text-primary">₹{customer.orderAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span className="font-medium">
                    {new Date(customer.orderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Project Progress</span>
                  <span className="font-semibold text-foreground">{customer.progress}%</span>
                </div>
                <Progress value={customer.progress} className="h-2.5" />
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  View Details
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(customer);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(customer.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center text-lg font-medium">
              No customers found matching your search.
            </p>
            <p className="text-muted-foreground text-center text-sm mt-2">
              Try adjusting your filters or search terms
            </p>
          </CardContent>
        </Card>
      )}

      <CustomerModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedCustomer(undefined);
        }}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer and all
              related data including documents, checklist, wiring, inspection, and commissioning
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;