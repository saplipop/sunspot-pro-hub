import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: "all" | "pending" | "in_progress" | "completed";
  onFilterChange: (filter: "all" | "pending" | "in_progress" | "completed") => void;
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

export function DashboardFilters({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  dateRange,
  onDateRangeChange,
}: DashboardFiltersProps) {
  const filterButtons = [
    { label: "All Projects", value: "all" as const, color: "bg-primary/10 text-primary hover:bg-primary/20" },
    { label: "Pending", value: "pending" as const, color: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
    { label: "In Progress", value: "in_progress" as const, color: "bg-warning/10 text-warning hover:bg-warning/20" },
    { label: "Completed", value: "completed" as const, color: "bg-success/10 text-success hover:bg-success/20" },
  ];

  const clearDateRange = () => {
    onDateRangeChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers by name or consumer number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Buttons and Date Range */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              className={cn(
                "transition-all duration-200",
                activeFilter === filter.value
                  ? "shadow-lg"
                  : filter.color
              )}
              onClick={() => onFilterChange(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  "Filter by date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange?.from, to: dateRange?.to }}
                onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
