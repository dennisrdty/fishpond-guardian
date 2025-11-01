import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  status: "normal" | "warning" | "danger";
  range: string;
}

export function MetricCard({ title, value, unit, icon: Icon, status, range }: MetricCardProps) {
  const statusColors = {
    normal: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const statusBadgeColors = {
    normal: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-destructive text-destructive-foreground",
  };

  const statusText = {
    normal: "Normal",
    warning: "Peringatan",
    danger: "Bahaya",
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${statusColors[status]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadgeColors[status]}`}>
            {statusText[status]}
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-foreground">{value}</span>
          <span className="text-xl text-muted-foreground">{unit}</span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Rentang normal: <span className="font-medium">{range}</span>
        </p>
      </div>
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300"
        style={{
          background: status === "normal" 
            ? "var(--gradient-success)" 
            : status === "warning"
            ? "hsl(var(--warning))"
            : "hsl(var(--destructive))"
        }}
      />
    </Card>
  );
}