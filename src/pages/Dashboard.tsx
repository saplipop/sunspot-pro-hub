import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sun,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  LogOut,
  Plus,
  UserCircle,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AddCustomerDialog from '@/components/customers/AddCustomerDialog';
import CustomerList from '@/components/customers/CustomerList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { customers, activityLogs, employees } = useData();
  const navigate = useNavigate();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const completedProjects = customers.filter((c) => c.progress === 100).length;
  const inProgressProjects = customers.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const pendingProjects = customers.filter((c) => c.progress === 0).length;

  const myCustomers =
    user?.role === 'employee'
      ? customers.filter((c) => c.assignedEmployeeId === user.id)
      : customers;

  const recentLogs = activityLogs.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-danger text-danger-foreground';
    }
  };

  const Navigation = () => (
    <nav className="space-y-1">
      <Button variant="ghost" className="w-full justify-start gap-2">
        <TrendingUp className="h-4 w-4" />
        Dashboard
      </Button>
      {user?.role === 'admin' && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => navigate('/employees')}
        >
          <Users className="h-4 w-4" />
          Employees
        </Button>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">SolarFlow</span>
                </div>
                <p className="text-xs text-muted-foreground">Project Tracker</p>
              </div>
              <Navigation />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">SolarFlow Track</span>
          </div>

          <div className="flex-1" />

          <Badge variant="outline" className="hidden sm:flex gap-1">
            <span className="font-medium">{user?.role === 'admin' ? '👑 Admin' : '🧑‍💻 Employee'}</span>
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-danger">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active solar projects
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully commissioned
              </p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgressProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Under installation
              </p>
            </CardContent>
          </Card>

          <Card className="border-danger/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <FileText className="h-5 w-5 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting action
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {user?.role === 'admin' ? 'All Customers' : 'My Projects'}
                </h2>
                <p className="text-muted-foreground">
                  Manage and track solar installations
                </p>
              </div>
              {user?.role === 'admin' && (
                <Button onClick={() => setAddCustomerOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
              )}
            </div>

            <CustomerList customers={myCustomers} />
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.section} • {log.user}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Overview</CardTitle>
                  <CardDescription>Employee statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Employees</span>
                      <span className="text-2xl font-bold">{employees.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <span className="text-lg font-semibold text-success">
                        {employees.filter((e) => e.status === 'active').length}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/employees')}
                    >
                      Manage Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
    </div>
  );
};

export default Dashboard;
