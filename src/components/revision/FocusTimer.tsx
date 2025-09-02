import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, StopCircle, Settings2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    id: string;
    subject: string;
    title: string;
    cycle: number;
    estimatedMinutes: number;
  };
  onComplete: (rating: 'Again' | 'Hard' | 'Good' | 'Easy', notes: string, actualMinutes: number) => void;
}

export const FocusTimer = ({ isOpen, onClose, topic, onComplete }: FocusTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(topic.estimatedMinutes * 60); // Start with estimated time
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [originalTime] = useState(topic.estimatedMinutes * 60);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false);
            toast({
              title: "Time's up! ⏰",
              description: "Time to evaluate your revision session.",
            });
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  // Check for paused sessions older than 24 hours
  useEffect(() => {
    if (isPaused && pausedAt) {
      const checkInterval = setInterval(() => {
        const hoursSincePaused = (Date.now() - pausedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSincePaused >= 24) {
          toast({
            title: "Long pause detected",
            description: "Do you want to mark this as complete? Please stop and save the topic to complete the journey.",
            variant: "destructive",
          });
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(checkInterval);
    }
  }, [isPaused, pausedAt]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!sessionId) {
      setSessionId(`session_${Date.now()}`);
    }
    setIsActive(true);
    setIsPaused(false);
    toast({
      title: "Revision started! 📚",
      description: "Focus on your studies. You've got this!",
    });
  };

  const handlePause = () => {
    if (!isPaused) {
      setPausedAt(new Date());
    } else {
      setPausedAt(null);
    }
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Revision resumed" : "Revision paused",
      description: isPaused ? "Back to studying!" : "Take a break if needed",
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(originalTime);
    setSessionId(null);
    setPausedAt(null);
    toast({
      title: "Timer reset",
      description: "Ready to start fresh!",
    });
  };

  const handleStop = () => {
    if (timeLeft > 0 && timeLeft < originalTime * 0.8) {
      setShowStopConfirm(true);
    } else {
      confirmStop();
    }
  };

  const confirmStop = () => {
    const actualMinutes = Math.ceil((originalTime - timeLeft) / 60);
    if (actualMinutes > 0) {
      setIsActive(false);
      setIsPaused(false);
      setPausedAt(null);
      onComplete('Good', notes, actualMinutes);
    } else {
      toast({
        title: "No time recorded",
        description: "Start the timer first to record your revision time.",
        variant: "destructive",
      });
    }
    setShowStopConfirm(false);
  };

  const handleAddCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes && minutes > 0 && minutes <= 120) {
      setTimeLeft(t => t + (minutes * 60));
      setCustomMinutes('');
      setShowCustomInput(false);
      toast({
        title: `Added ${minutes} minute(s)`,
        description: "Timer extended successfully!",
      });
    } else {
      toast({
        title: "Invalid input",
        description: "Please enter a number between 1 and 120 minutes.",
        variant: "destructive",
      });
    }
  };

  const handleFinish = (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    const actualMinutes = Math.ceil((originalTime - timeLeft) / 60);
    setIsActive(false);
    setIsPaused(false);
    setPausedAt(null);
    onComplete(rating, notes, actualMinutes);
  };

  const progress = ((originalTime - timeLeft) / originalTime) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{topic.title}</span>
              <Badge variant="outline">{topic.subject}</Badge>
              <Badge variant="secondary">Cycle {topic.cycle}d</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Est. {topic.estimatedMinutes}m
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className={`text-6xl font-mono font-bold transition-colors ${
              isActive && !isPaused 
                ? timeLeft <= 300 ? 'text-destructive animate-pulse' : 'text-primary' 
                : isPaused 
                ? 'text-warning' 
                : 'text-foreground'
            }`}>
              {formatTime(timeLeft)}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex flex-col space-y-4">
              {/* Main Timer Controls */}
              <div className="flex justify-center items-center space-x-3 flex-wrap gap-2">
                {!isActive ? (
                  <Button 
                    onClick={handleStart}
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Revision</span>
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handlePause}
                      variant="outline"
                      size="lg"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    
                    {!showCustomInput && (
                      <Button 
                        onClick={() => setShowCustomInput(true)}
                        variant="outline"
                        size="lg"
                      >
                        <Settings2 className="h-4 w-4 mr-2" />
                        Add Time
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>

                    <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          onClick={handleStop}
                          variant="destructive"
                          size="lg"
                        >
                          <StopCircle className="h-4 w-4 mr-2" />
                          Stop & Save
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Stop Revision Early?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to stop and save it as a completed revision? 
                            If you haven't completed this topic, please click "Pause" and the timer will resume from the time left for the topic.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => {
                            setShowStopConfirm(false);
                            handlePause();
                          }}>
                            Pause Instead
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={confirmStop} className="bg-destructive hover:bg-destructive/90">
                            Stop & Save
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>

              {/* Add Time Section */}
              {showCustomInput && (
                <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg">
                  <Label htmlFor="custom-minutes" className="text-xs">Minutes:</Label>
                  <Input 
                    id="custom-minutes"
                    type="number" 
                    placeholder="1-120"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-20 h-8 text-sm"
                    min="1"
                    max="120"
                  />
                  <Button onClick={handleAddCustomTime} size="sm" className="h-8">Add</Button>
                  <Button onClick={() => setShowCustomInput(false)} variant="ghost" size="sm" className="h-8">Cancel</Button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Revision Notes</Label>
            <Textarea
              id="notes"
              placeholder="Take notes during your revision session... (autosaves)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 mt-2"
            />
          </div>

          {/* Recall Rating (only show if timer has been running) */}
          {(isActive || timeLeft < originalTime) && (
            <div>
              <h3 className="font-semibold mb-4 text-center">
                How was your recall for this topic?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => handleFinish('Again')}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto p-4 border-destructive/50 hover:bg-destructive/5"
                >
                  <span className="text-lg">😰</span>
                  <span className="text-xs font-medium">Again</span>
                  <span className="text-xs text-muted-foreground text-center">Need more practice</span>
                </Button>
                
                <Button
                  onClick={() => handleFinish('Hard')}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto p-4 border-warning/50 hover:bg-warning/5"
                >
                  <span className="text-lg">😕</span>
                  <span className="text-xs font-medium">Hard</span>
                  <span className="text-xs text-muted-foreground text-center">Struggled a bit</span>
                </Button>
                
                <Button
                  onClick={() => handleFinish('Good')}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto p-4 border-success/50 hover:bg-success/5"
                >
                  <span className="text-lg">🙂</span>
                  <span className="text-xs font-medium">Good</span>
                  <span className="text-xs text-muted-foreground text-center">Went well</span>
                </Button>
                
                <Button
                  onClick={() => handleFinish('Easy')}
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto p-4 border-primary/50 hover:bg-primary/5"
                >
                  <span className="text-lg">😄</span>
                  <span className="text-xs font-medium">Easy</span>
                  <span className="text-xs text-muted-foreground text-center">Nailed it!</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};