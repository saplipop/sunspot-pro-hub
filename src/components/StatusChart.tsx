import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StatusChartProps {
  pending: number;
  inProgress: number;
  completed: number;
}

export const StatusChart = ({ pending, inProgress, completed }: StatusChartProps) => {
  const data = [
    { name: "Pending", value: pending, color: "hsl(var(--status-pending))" },
    { name: "In Progress", value: inProgress, color: "hsl(var(--status-in-progress))" },
    { name: "Completed", value: completed, color: "hsl(var(--status-completed))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
