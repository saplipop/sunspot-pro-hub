import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, MapPin, Zap, DollarSign, Calendar } from 'lucide-react';
import NewConnectionSection from '@/components/sections/NewConnectionSection';
import SolarChecklistSection from '@/components/sections/SolarChecklistSection';
import SanctionSection from '@/components/sections/SanctionSection';
import JansamarthSection from '@/components/sections/JansamarthSection';
import CompletionReportSection from '@/components/sections/CompletionReportSection';
import RTSDocumentSection from '@/components/sections/RTSDocumentSection';
import WiringStatusSection from '@/components/sections/WiringStatusSection';
import InspectionQCSection from '@/components/sections/InspectionQCSection';
import ReleaseOrderSection from '@/components/sections/ReleaseOrderSection';
import MeterFittingSection from '@/components/sections/MeterFittingSection';
import CommissioningSection from '@/components/sections/CommissioningSection';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, employees } = useData();
  const { user } = useAuth();

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Customer not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const assignedEmployee = employees.find(
    (e) => e.id === customer.assignedEmployeeId
  );

  const getStatusColor = (progress: number) => {
    if (progress === 0) return 'bg-danger';
    if (progress < 100) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{customer.name}</h1>
            <p className="text-xs text-muted-foreground">
              Consumer #{customer.consumerNumber}
            </p>
          </div>
          <Badge
            className={`${getStatusColor(customer.progress)} text-white`}
          >
            {customer.progress}% Complete
          </Badge>
        </div>
      </header>

      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Customer Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{customer.name}</div>
              <p className="text-xs text-muted-foreground">{customer.mobile}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">{customer.address}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Capacity</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.systemCapacity} kW</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Order Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{customer.orderAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Progress</CardTitle>
              <Badge variant="outline">
                {assignedEmployee ? assignedEmployee.name : 'Unassigned'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={customer.progress} className="h-3" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {customer.progress === 0
                  ? 'Not Started'
                  : customer.progress === 100
                  ? 'Completed'
                  : 'In Progress'}
              </span>
              <span className="text-sm font-medium">{customer.progress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Sections Tabs */}
        <Tabs defaultValue="new-connection" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="new-connection" className="text-xs">New Connection</TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
            <TabsTrigger value="sanction" className="text-xs">Sanction</TabsTrigger>
            <TabsTrigger value="jansamarth" className="text-xs">Jansamarth</TabsTrigger>
            <TabsTrigger value="completion" className="text-xs">Completion</TabsTrigger>
            <TabsTrigger value="rts" className="text-xs">RTS</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="wiring" className="text-xs">Wiring</TabsTrigger>
            <TabsTrigger value="inspection" className="text-xs">Inspection QC</TabsTrigger>
            <TabsTrigger value="release" className="text-xs">Release Order</TabsTrigger>
            <TabsTrigger value="meter" className="text-xs">Meter Fitting</TabsTrigger>
            <TabsTrigger value="commissioning" className="text-xs">Commissioning</TabsTrigger>
          </TabsList>

          <TabsContent value="new-connection">
            <NewConnectionSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="checklist">
            <SolarChecklistSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="sanction">
            <SanctionSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="jansamarth">
            <JansamarthSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="completion">
            <CompletionReportSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="rts">
            <RTSDocumentSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="wiring">
            <WiringStatusSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="inspection">
            <InspectionQCSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="release">
            <ReleaseOrderSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="meter">
            <MeterFittingSection customerId={customer.id} />
          </TabsContent>
          <TabsContent value="commissioning">
            <CommissioningSection customerId={customer.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDetail;
