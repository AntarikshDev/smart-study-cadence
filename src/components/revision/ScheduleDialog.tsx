import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, XCircle, Pause, RotateCcw } from 'lucide-react';
import { Topic } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

interface ScheduleEntry {
  id: string;
  cycle: number;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  isSnoozed: boolean;
  snoozeDate?: Date;
  rating?: string;
  actualMinutes?: number;
}

export const ScheduleDialog = ({ isOpen, onClose, topic }: ScheduleDialogProps) => {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    if (topic && isOpen) {
      generateScheduleEntries();
    }
  }, [topic, isOpen]);

  const generateScheduleEntries = () => {
    if (!topic) return;

    const entries: ScheduleEntry[] = [];
    const cycles = [7, 14, 21, 28]; // Spaced repetition intervals
    let baseDate = new Date(topic.firstStudied);

    cycles.forEach((cycle, index) => {
      const dueDate = new Date(baseDate);
      dueDate.setDate(baseDate.getDate() + cycle);

      // Mock some completed and snoozed entries for demo
      const isCompleted = Math.random() > 0.5 && index < 2;
      const isSnoozed = !isCompleted && Math.random() > 0.7;

      entries.push({
        id: `${topic.id}_cycle_${cycle}`,
        cycle,
        dueDate,
        isCompleted,
        completedAt: isCompleted ? new Date(dueDate.getTime() + Math.random() * 86400000) : undefined,
        isSnoozed,
        snoozeDate: isSnoozed ? new Date(dueDate.getTime() + 3 * 86400000) : undefined,
        rating: isCompleted ? ['Easy', 'Good', 'Hard', 'Again'][Math.floor(Math.random() * 4)] : undefined,
        actualMinutes: isCompleted ? Math.floor(Math.random() * 30) + 20 : undefined,
      });

      baseDate = dueDate;
    });

    setScheduleEntries(entries);
  };

  const handleRegenerateSchedule = () => {
    if (!topic) return;
    
    toast({
      title: "Schedule regenerated",
      description: `Schedule for ${topic.title} has been regenerated from today.`,
    });
    
    generateScheduleEntries();
  };

  const getStatusIcon = (entry: ScheduleEntry) => {
    if (entry.isCompleted) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (entry.isSnoozed) return <Pause className="h-4 w-4 text-orange-500" />;
    if (entry.dueDate < new Date()) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getStatusText = (entry: ScheduleEntry) => {
    if (entry.isCompleted) return 'Completed';
    if (entry.isSnoozed) return 'Snoozed';
    if (entry.dueDate < new Date()) return 'Overdue';
    return 'Pending';
  };

  const getStatusColor = (entry: ScheduleEntry) => {
    if (entry.isCompleted) return 'bg-emerald-50 border-emerald-200';
    if (entry.isSnoozed) return 'bg-orange-50 border-orange-200';
    if (entry.dueDate < new Date()) return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700';
      case 'Good': return 'bg-blue-100 text-blue-700';
      case 'Hard': return 'bg-orange-100 text-orange-700';
      case 'Again': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!topic) return null;

  const completedEntries = scheduleEntries.filter(e => e.isCompleted);
  const totalMinutes = completedEntries.reduce((sum, e) => sum + (e.actualMinutes || 0), 0);
  const avgMinutes = completedEntries.length > 0 ? Math.round(totalMinutes / completedEntries.length) : 0;
  const onTimeRate = scheduleEntries.length > 0 
    ? Math.round((completedEntries.filter(e => e.completedAt && e.completedAt <= e.dueDate).length / Math.max(1, scheduleEntries.filter(e => e.dueDate <= new Date()).length)) * 100)
    : 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Revision Schedule: {topic.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Topic Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{topic.subject}</Badge>
                  <div className="text-sm text-muted-foreground">
                    First studied: {topic.firstStudied.toLocaleDateString()}
                  </div>
                </div>
                <Button 
                  onClick={handleRegenerateSchedule}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Regenerate from Today</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{completedEntries.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalMinutes}m</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{avgMinutes}m</div>
                <div className="text-sm text-muted-foreground">Avg per Session</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{onTimeRate}%</div>
                <div className="text-sm text-muted-foreground">On-time Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Timeline */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Revision Timeline</h3>
              
              <div className="space-y-3">
                {scheduleEntries.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className={`p-4 rounded-lg border ${getStatusColor(entry)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(entry)}
                        <div>
                          <div className="font-medium">
                            Cycle {entry.cycle} days
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Due: {entry.dueDate.toLocaleDateString()}
                            {entry.isSnoozed && entry.snoozeDate && (
                              <span className="ml-2 text-orange-600">
                                → Snoozed to {entry.snoozeDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getStatusText(entry)}
                        </Badge>
                        
                        {entry.rating && (
                          <Badge className={getRatingColor(entry.rating)}>
                            {entry.rating}
                          </Badge>
                        )}
                        
                        {entry.actualMinutes && (
                          <Badge variant="secondary">
                            {entry.actualMinutes}m
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {entry.completedAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Completed on {entry.completedAt.toLocaleDateString()} at {entry.completedAt.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Future Predictions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Next Scheduled Revisions</h3>
              <div className="space-y-2">
                {scheduleEntries
                  .filter(e => e.dueDate > new Date() && !e.isSnoozed)
                  .slice(0, 3)
                  .map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">
                        Cycle {entry.cycle} days
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {entry.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};