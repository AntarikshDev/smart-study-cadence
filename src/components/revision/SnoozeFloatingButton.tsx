import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Calendar, Moon, Sunrise } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SnoozeFloatingButtonProps {
  onSnooze: (days: number, cascade: boolean) => void;
  pendingCount: number;
}

export const SnoozeFloatingButton = ({ onSnooze, pendingCount }: SnoozeFloatingButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState('');
  const [cascadeEnabled, setCascadeEnabled] = useState(true);

  const quickOptions = [
    { days: 1, label: '1 Day', icon: Sunrise, description: 'Resume tomorrow' },
    { days: 3, label: '3 Days', icon: Clock, description: 'Short break' },
    { days: 7, label: '1 Week', icon: Calendar, description: 'Week break' },
  ];

  const handleSnooze = () => {
    const days = selectedDays || parseInt(customDays);
    
    if (!days || days < 1 || days > 30) {
      toast({
        title: "Invalid input",
        description: "Please select 1-30 days.",
        variant: "destructive",
      });
      return;
    }

    onSnooze(days, cascadeEnabled);
    
    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + days);
    
    toast({
      title: "All revisions snoozed! 😴",
      description: `${pendingCount} topic(s) snoozed for ${days} day(s). Resume on ${resumeDate.toLocaleDateString()}`,
    });
    
    setShowDialog(false);
    setSelectedDays(null);
    setCustomDays('');
  };

  const handleClose = () => {
    setShowDialog(false);
    setSelectedDays(null);
    setCustomDays('');
  };

  if (pendingCount === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setShowDialog(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-warning hover:bg-warning/90"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <Moon className="h-5 w-5" />
          <span className="text-xs font-medium">{pendingCount}</span>
        </div>
      </Button>

      {/* Snooze Dialog */}
      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Moon className="h-5 w-5" />
              <span>Snooze All Revisions</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Pending count */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">
                topic(s) will be snoozed
              </div>
            </div>

            {/* Quick options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Options</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card 
                      key={option.days}
                      className={`cursor-pointer transition-all ${
                        selectedDays === option.days 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedDays(option.days);
                        setCustomDays('');
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                          {selectedDays === option.days && (
                            <Badge variant="default" className="text-xs">Selected</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Custom input */}
            <div className="space-y-2">
              <Label htmlFor="customDays">Custom Days (1-30)</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="30"
                value={customDays}
                onChange={(e) => {
                  setCustomDays(e.target.value);
                  setSelectedDays(null);
                }}
                placeholder="Enter custom days..."
                className="text-center"
              />
            </div>

            {/* Cascade option */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="cascade" className="text-sm font-medium">
                  Cascade Snooze
                </Label>
                <p className="text-xs text-muted-foreground">
                  Shift all future revisions by the same amount
                </p>
              </div>
              <Switch
                id="cascade"
                checked={cascadeEnabled}
                onCheckedChange={setCascadeEnabled}
              />
            </div>

            {/* Preview */}
            {(selectedDays || customDays) && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm">
                  <div className="font-medium text-foreground">Preview:</div>
                  <div className="text-muted-foreground">
                    All {pendingCount} revision(s) will resume on{' '}
                    <span className="font-medium">
                      {new Date(Date.now() + (selectedDays || parseInt(customDays) || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                    {cascadeEnabled && (
                      <span className="block mt-1 text-xs">
                        Future revisions will also be shifted by the same amount
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSnooze}
                disabled={!selectedDays && !customDays}
                className="flex-1"
              >
                Snooze All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};