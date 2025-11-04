import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  status: "normal" | "warning" | "danger";
  range: string;
  size?: "normal" | "large";
}

export function MetricCard({ title, value, unit, icon: Icon, status, range, size = "normal" }: MetricCardProps) {
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

  const isLarge = size === "large";

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 group glass-card ${isLarge ? "min-w-[320px] animate-fade-in" : ""}`}>
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating icon background */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 ${isLarge ? "group-hover:animate-float" : ""}`}>
        <Icon className="w-full h-full" />
      </div>
      
      <div className={`relative z-10 ${isLarge ? "p-8" : "p-6"}`}>
        <div className={`flex items-start justify-between ${isLarge ? "mb-6" : "mb-4"}`}>
          <div className={`${isLarge ? "p-4" : "p-3"} rounded-xl ${statusColors[status]} transition-all duration-300 group-hover:scale-110 ${isLarge ? "animate-glow" : ""}`}>
            <Icon className={`${isLarge ? "h-10 w-10" : "h-6 w-6"} transition-transform duration-300 group-hover:rotate-12`} />
          </div>
          <span className={`${isLarge ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"} font-medium rounded-full ${statusBadgeColors[status]} shadow-lg animate-scale-in`}>
            {statusText[status]}
          </span>
        </div>
        
        <h3 className={`${isLarge ? "text-lg" : "text-sm"} font-medium text-muted-foreground ${isLarge ? "mb-4" : "mb-2"}`}>{title}</h3>
        
        <div className={`flex items-baseline gap-2 ${isLarge ? "mb-4" : "mb-2"}`}>
          <span className={`${isLarge ? "text-6xl" : "text-4xl"} font-bold text-foreground transition-all duration-300 group-hover:text-primary`}>{value}</span>
          <span className={`${isLarge ? "text-3xl" : "text-xl"} text-muted-foreground`}>{unit}</span>
        </div>
        
        <p className={`${isLarge ? "text-sm" : "text-xs"} text-muted-foreground`}>
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