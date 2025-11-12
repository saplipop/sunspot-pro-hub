import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChart } from "@/components/StatusChart";
import { InspectionDeadlineChecker } from "@/components/InspectionDeadlineChecker";
import {
  Users,
  FileWarning,
  Clock,
  CheckCircle,
  Search,
  UserCog,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import { calculateOverallProgress } from "@/lib/progressCalculator";
import { Customer, ActivityLog } from "@/data/mockData";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  // Load data
  useEffect(() => {
    loadData();

    // Listen for storage changes
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
    setActivities(storage.getActivities().slice(0, 10));
    setRefreshKey((prev) => prev + 1);
  };

  // Calculate stats
  const customersWithProgress = customers.map((customer) => ({
    ...customer,
    progress: calculateOverallProgress(customer.id),
  }));

  const totalCustomers = customers.length;
  const activeProjects = customersWithProgress.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const completedProjects = customersWithProgress.filter((c) => c.progress === 100).length;
  const pendingProjects = customersWithProgress.filter((c) => c.progress === 0).length;

  // Pending documents count
  const allDocuments = storage.getDocuments();
  const pendingDocuments = allDocuments.filter((d) => d.status === "pending").length;

  // Total employees
  const totalEmployees = storage.getEmployees().length;

  // Filter customers for search
  const filteredCustomers = customersWithProgress.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.consumerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-success";
    if (progress >= 50) return "bg-warning";
    return "bg-destructive";
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, <span className="font-semibold text-foreground">{user?.username}</span> • {user?.role}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate("/customers")} className="shadow-md" size="lg">
            <Users className="h-4 w-4 mr-2" />
            Manage Customers
          </Button>
        )}
      </div>

      <InspectionDeadlineChecker />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift cursor-pointer border-2 hover:border-primary/50" onClick={() => navigate("/customers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-foreground">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProjects} active projects
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer border-2 hover:border-warning/50" onClick={() => navigate("/customers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-warning">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer border-2 hover:border-success/50" onClick={() => navigate("/customers")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-success">{completedProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="hover-lift cursor-pointer border-2 hover:border-destructive/50" onClick={() => navigate("/documents")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <FileWarning className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-destructive">{pendingDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting upload</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading">Project Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusChart
              pending={pendingProjects}
              inProgress={activeProjects}
              completed={completedProjects}
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Activity className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.section} •{" "}
                        {new Date(activity.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {activities.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/activity-log")}
                >
                  View All Activity
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-heading text-2xl">All Customers</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No customers found
              </p>
            ) : (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-5 rounded-xl border-2 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-semibold text-lg">{customer.name}</h3>
                      {getProgressBadge(customer.progress)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Consumer:</span> {customer.consumerNumber}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Capacity:</span> {customer.systemCapacity} kW
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Amount:</span> ₹{customer.orderAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-semibold mb-1">{customer.progress}%</div>
                      <div className="w-32 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(customer.progress)} transition-all duration-500`}
                          style={{ width: `${customer.progress}%` }}
                        />
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
