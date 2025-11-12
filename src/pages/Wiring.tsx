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
import { Search, Cable, Eye } from "lucide-react";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { Customer } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";

const Wiring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
    setCustomers(storage.getCustomers());
    setRefreshKey((prev) => prev + 1);
  };

  const customersWithWiring = customers.map((customer) => ({
    customer,
    wiring: storage.getCustomerWiring(customer.id),
  })).filter((item) => item.wiring); // Only show customers with wiring data

  const filteredCustomers = customersWithWiring.filter(({ customer, wiring }) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.consumerNumber.toLowerCase().includes(searchLower) ||
      (wiring?.technicianName && wiring.technicianName.toLowerCase().includes(searchLower))
    );
  });

  const completedCount = customersWithWiring.filter(({ wiring }) => wiring?.status === "completed").length;
  const inProgressCount = customersWithWiring.filter(({ wiring }) => wiring?.status === "in_progress").length;
  const pendingCount = customersWithWiring.filter(({ wiring }) => wiring?.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Wiring</h2>
        <p className="text-muted-foreground">Track wiring progress across all customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithWiring.length}</div>
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
          placeholder="Search customers or technicians..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Wiring Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wiring Details ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Consumer No.</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Capacity (kW)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Cable className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No wiring records found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(({ customer, wiring }) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Cable className="h-4 w-4 text-primary" />
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{customer.consumerNumber}</TableCell>
                    <TableCell className="text-sm">{wiring?.technicianName || "-"}</TableCell>
                    <TableCell className="text-sm">{wiring?.startDate || "-"}</TableCell>
                    <TableCell className="text-sm">{wiring?.endDate || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {wiring?.aggregateCapacity ? `${wiring.aggregateCapacity} kW` : "-"}
                    </TableCell>
                    <TableCell>
                      {wiring && <StatusBadge status={wiring.status} />}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/customers/${customer.id}`)}
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

export default Wiring;
