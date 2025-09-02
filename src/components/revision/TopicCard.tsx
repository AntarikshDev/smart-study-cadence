import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  Play, 
  Clock, 
  MoreVertical, 
  Pause, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { TopicCardData } from '@/types/revision';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: TopicCardData;
  onStart: (topicId: string) => void;
  onSnooze: (scheduleId: string, days: number, cascade: boolean) => void;
  onViewSchedule: (topicId: string) => void;
}

export const TopicCard = ({ topic, onStart, onSnooze, onViewSchedule }: TopicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = () => {
    switch (topic.dueStatus) {
      case 'Due Today':
        return <Badge variant="due">Due Today</Badge>;
      case 'Overdue':
        return (
          <Badge variant="overdue" className="animate-pulse">
            Overdue {topic.daysOverdue}d
          </Badge>
        );
      case 'Snoozed':
        return (
          <Badge variant="snoozed">
            Snoozed +{topic.snoozeInfo?.days}d
            {topic.snoozeInfo?.cascading && " (cascading)"}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (topic.dueStatus) {
      case 'Due Today':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'Snoozed':
        return <Pause className="h-4 w-4 text-muted-foreground" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer border-l-4",
        topic.dueStatus === 'Overdue' 
          ? "border-l-destructive hover:shadow-lg shadow-destructive/5" 
          : topic.dueStatus === 'Due Today'
          ? "border-l-warning hover:shadow-lg shadow-warning/5"
          : "border-l-primary hover:shadow-md",
        isHovered && "scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {topic.subject}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Cycle {topic.cycle}d
              </Badge>
              {getStatusBadge()}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
              {topic.title}
            </h3>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{topic.estimatedMinutes}m</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                {topic.snoozeInfo && topic.dueStatus === 'Snoozed' && (
                  <span className="text-xs">
                    starts in {topic.snoozeInfo.startsIn}
                  </span>
                )}
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs text-muted-foreground">Progress:</span>
              <div className="flex space-x-1">
                {topic.progress.map((completed, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      completed 
                        ? "bg-success" 
                        : "bg-muted border border-border"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => onStart(topic.id)}
              className="flex items-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Start</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSnooze(topic.scheduleId, 1, false)}>
                  Snooze 1 day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSnooze(topic.scheduleId, 3, false)}>
                  Snooze 3 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSnooze(topic.scheduleId, 7, false)}>
                  Snooze 1 week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewSchedule(topic.id)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Next dates preview (on hover) */}
        {isHovered && topic.nextDates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border animate-fade-in">
            <div className="text-xs text-muted-foreground mb-1">Next revisions:</div>
            <div className="flex space-x-2">
              {topic.nextDates.slice(0, 3).map((date, index) => (
                <span 
                  key={index}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  {date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};