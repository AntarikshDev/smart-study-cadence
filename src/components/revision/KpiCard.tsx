import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: {
    value: number;
    isPositive: boolean;
  };
  sparkline?: number[];
  className?: string;
}

export const KpiCard = ({ 
  title, 
  value, 
  icon: Icon, 
  delta, 
  sparkline, 
  className 
}: KpiCardProps) => {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          
          {delta && (
            <div className={cn(
              "text-xs font-medium",
              delta.isPositive ? "text-success" : "text-destructive"
            )}>
              {delta.isPositive ? "+" : ""}{delta.value}%
            </div>
          )}
        </div>
        
        <div className="mt-2 flex items-end justify-between">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          
          {sparkline && (
            <div className="flex items-end space-x-0.5 h-6">
              {sparkline.map((point, index) => (
                <div
                  key={index}
                  className="bg-primary/30 rounded-sm w-1"
                  style={{ 
                    height: `${(point / Math.max(...sparkline)) * 100}%`,
                    minHeight: '2px'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};