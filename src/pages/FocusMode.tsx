import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Pause, RotateCcw, Plus, CheckCircle2 } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { toast } from '@/hooks/use-toast';

export default function FocusMode() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [estimatedMinutes] = useState(45); // From topic data
  const [notes, setNotes] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Sample topic data - in real app would fetch based on topicId
  const topic = {
    id: topicId || '1',
    subject: 'Mathematics',
    title: 'Differential Calculus',
    cycle: 7,
    estimatedMinutes: 45,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      const result = await mockApi.startTimer(topic.id, estimatedMinutes * 60);
      setSessionId(result.sessionId);
      setIsActive(true);
      setIsPaused(false);
      toast({
        title: "Timer started",
        description: "Focus session began. Good luck!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Timer resumed" : "Timer paused",
      description: isPaused ? "Keep going!" : "Take a break if needed",
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
    setSessionId(null);
  };

  const handleAddMinute = () => {
    setSeconds(s => s + 60);
    toast({
      title: "Added 1 minute",
      description: "Timer extended",
    });
  };

  const handleFinish = (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    if (!sessionId) return;
    
    mockApi.finishTimer(sessionId, seconds, rating, notes)
      .then(() => {
        toast({
          title: "Session completed!",
          description: `Logged ${formatTime(seconds)} • Next due in 14 days`,
        });
        navigate('/');
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to save session",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{topic.subject}</Badge>
              <Badge variant="secondary">Cycle {topic.cycle}d</Badge>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Est. {topic.estimatedMinutes}m
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Topic Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {topic.title}
            </h1>
            <p className="text-muted-foreground">
              Focus on your revision. You've got this!
            </p>
          </div>

          {/* Timer Display */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className={`text-6xl font-mono font-bold transition-colors ${
                  isActive && !isPaused 
                    ? 'text-timer-active animate-pulse' 
                    : isPaused 
                    ? 'text-timer-paused' 
                    : 'text-foreground'
                }`}>
                  {formatTime(seconds)}
                </div>

                <div className="flex justify-center space-x-4">
                  {!isActive ? (
                    <Button 
                      onClick={handleStart}
                      size="lg"
                      className="flex items-center space-x-2"
                    >
                      <Play className="h-5 w-5" />
                      <span>Start Timer</span>
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
                      
                      <Button 
                        onClick={handleAddMinute}
                        variant="outline"
                        size="lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        +1m
                      </Button>
                      
                      <Button 
                        onClick={handleReset}
                        variant="outline"
                        size="lg"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Revision Notes</h3>
              <Textarea
                placeholder="Take notes during your revision session... (autosaves)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* Recall Rating (only show if timer is active) */}
          {isActive && seconds > 60 && (
            <Card>
              <CardContent className="p-6">
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
                    <span className="text-xs">Again</span>
                    <span className="text-xs text-muted-foreground">Need more practice</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleFinish('Hard')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-warning/50 hover:bg-warning/5"
                  >
                    <span className="text-lg">😕</span>
                    <span className="text-xs">Hard</span>
                    <span className="text-xs text-muted-foreground">Struggled a bit</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleFinish('Good')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-success/50 hover:bg-success/5"
                  >
                    <span className="text-lg">🙂</span>
                    <span className="text-xs">Good</span>
                    <span className="text-xs text-muted-foreground">Went well</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleFinish('Easy')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto p-4 border-primary/50 hover:bg-primary/5"
                  >
                    <span className="text-lg">😄</span>
                    <span className="text-xs">Easy</span>
                    <span className="text-xs text-muted-foreground">Nailed it!</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Actions */}
          {isActive && (
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/focus')}
              >
                Next Topic
              </Button>
              <Button 
                onClick={() => navigate('/')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Return to Queue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}