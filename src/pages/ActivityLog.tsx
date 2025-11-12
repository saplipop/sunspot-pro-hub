import { useState, useEffect } from "react";
import { mockCustomers, ActivityLog as ActivityLogType } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Calendar, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storage, STORAGE_CHANGE_EVENT } from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState<string>("all");
  const [activities, setActivities] = useState<ActivityLogType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();

    const handleStorageChange = () => {
      loadActivities();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  const loadActivities = () => {
    setActivities(storage.getActivities());
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection =
      filterSection === "all" || activity.section.toLowerCase() === filterSection.toLowerCase();

    return matchesSearch && matchesSection;
  });

  const getCustomerName = (customerId: string) => {
    return mockCustomers.find((c) => c.id === customerId)?.name || "Unknown";
  };

  const getSectionColor = (section: string) => {
    const colors: Record<string, string> = {
      Documents: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Checklist: "bg-green-500/10 text-green-500 border-green-500/20",
      Wiring: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Inspection: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Commissioning: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      Assignment: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Employee: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      Customer: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    };
    return colors[section] || "bg-muted text-muted-foreground";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: ActivityLogType) => {
    if (activity.customerId && activity.customerId !== "") {
      // Navigate to customer detail page with section hash
      const sectionMap: Record<string, string> = {
        documents: "#documents",
        document: "#documents",
        checklist: "#checklist",
        wiring: "#wiring",
        inspection: "#inspection",
        commissioning: "#commissioning",
        tasks: "#tasks",
        task: "#tasks",
      };
      
      const sectionKey = activity.section.toLowerCase();
      const hash = sectionMap[sectionKey] || "";
      navigate(`/customers/${activity.customerId}${hash}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Activity Log</h2>
        <p className="text-muted-foreground">
          Track all system activities and updates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="wiring">Wiring</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="commissioning">Commissioning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 p-4 border rounded-lg transition-all ${
                  activity.customerId && activity.customerId !== ""
                    ? "cursor-pointer hover:bg-muted/50 hover:border-primary/50"
                    : "hover:bg-muted/30"
                }`}
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getSectionColor(activity.section)} variant="outline">
                      {activity.section}
                    </Badge>
                    {activity.customerId && activity.customerId !== "" && (
                      <span className="text-sm font-medium text-foreground">
                        {getCustomerName(activity.customerId)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {" "}
                        {activity.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getTimeAgo(activity.date)}
                    </div>
                    {activity.customerId && activity.customerId !== "" && (
                      <div className="flex items-center gap-1 text-primary">
                        <span>View Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No activities found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;