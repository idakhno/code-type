import { Clock, Target, AlertCircle, Zap } from "lucide-react";
import { Card } from "@/shared/ui/card";

interface StatsPanelProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
}

export const StatsPanel = ({ wpm, accuracy, errors, timeElapsed }: StatsPanelProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const stats = [
    { icon: Zap, label: "WPM", value: wpm, color: "text-primary" },
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, color: "text-green-500" },
    { icon: AlertCircle, label: "Errors", value: errors, color: "text-destructive" },
    { icon: Clock, label: "Time", value: formatTime(timeElapsed), color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

