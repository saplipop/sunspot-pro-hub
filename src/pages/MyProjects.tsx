import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCustomers, mockEmployees } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, ListTodo, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const MyProjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Find employee by username (simplified for demo)
  const employee = mockEmployees.find((emp) => emp.email.startsWith(user?.username || ""));

  // Get assigned customers
  const assignedCustomers = mockCustomers
    .filter((customer) => employee?.assignedCustomers.includes(customer.id))
    .map((customer) => ({
      ...customer,
      //progress: calculateCustomerProgress(customer.id),
    }));

  const filteredCustomers = assignedCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.consumerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  // const totalProjects = assignedCustomers.length;
  // const pendingTasks = assignedCustomers.filter((c) => c.progress < 50).length;
  // const inProgress = assignedCustomers.filter((c) => c.progress >= 50 && c.progress < 100).length;
  // const completed = assignedCustomers.filter((c) => c.progress === 100).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">My Assigned Projects</h2>
        <p className="text-muted-foreground">
          Manage your assigned customer projects
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{totalProjects}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <FileText className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{pendingTasks}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FileText className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{inProgress}</div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{completed}</div> */}
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or consumer number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate(`/customers/${customer.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{customer.name}</span>
                {/* <Badge
                  className={
                    customer.progress === 100
                      ? "bg-success text-success-foreground"
                      : customer.progress > 0
                      ? "bg-warning text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {customer.progress}%
                </Badge> */}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                <span className="font-medium">{customer.systemCapacity} kW</span>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Project Progress</span>
                  {/* <span className="font-medium">{customer.progress}%</span> */}
                </div>
                {/* <Progress value={customer.progress} className="h-2" /> */}
              </div>

              <Button variant="outline" className="w-full" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {assignedCustomers.length === 0
                ? "No projects assigned yet. Contact your administrator."
                : "No projects found matching your search."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProjects;