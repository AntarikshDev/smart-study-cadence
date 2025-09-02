import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FocusTimer } from '@/components/revision/FocusTimer';
import { ArrowLeft, Timer, History, Play, BarChart3 } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { toast } from '@/hooks/use-toast';

interface RevisionSession {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  duration: number;
  rating: string;
  date: Date;
  notes?: string;
}

export default function FocusMode() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<RevisionSession[]>([]);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);

  // Mock session history
  const mockSessions: RevisionSession[] = [
    {
      id: '1',
      topicId: '1',
      topicTitle: 'Differential Calculus',
      subject: 'Mathematics', 
      duration: 42,
      rating: 'Good',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Focused on chain rule applications'
    },
    {
      id: '2',
      topicId: '2',
      topicTitle: 'Quantum Mechanics',
      subject: 'Physics',
      duration: 55,
      rating: 'Hard',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      notes: 'Wave functions still confusing'
    },
    {
      id: '3',
      topicId: '1',
      topicTitle: 'Differential Calculus',
      subject: 'Mathematics',
      duration: 38,
      rating: 'Easy',
      date: new Date(),
      notes: 'Much clearer now!'
    },
  ];

  useEffect(() => {
    loadFocusData();
  }, [topicId]);

  const loadFocusData = async () => {
    try {
      setLoading(true);
      
      // Load available topics from dashboard
      const dashboardData = await mockApi.getDashboardData();
      setAvailableTopics(dashboardData.dueToday);
      
      // Set selected topic
      if (topicId) {
        const topic = dashboardData.dueToday.find(t => t.id === topicId);
        if (topic) {
          setSelectedTopic({
            id: topic.id,
            subject: topic.subject,
            title: topic.title,
            cycle: topic.cycle,
            estimatedMinutes: topic.estimatedMinutes,
          });
        }
      }
      
      // Load session history
      setSessions(mockSessions);
    } catch (error) {
      toast({
        title: "Error loading focus data",
        description: "Failed to load focus mode data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic({
      id: topic.id,
      subject: topic.subject,
      title: topic.title,
      cycle: topic.cycle,
      estimatedMinutes: topic.estimatedMinutes,
    });
  };

  const handleStartRevision = () => {
    if (!selectedTopic) {
      toast({
        title: "No topic selected",
        description: "Please select a topic first.",
        variant: "destructive",
      });
      return;
    }
    setShowTimer(true);
  };

  const handleTimerComplete = async (rating: string, notes: string, actualMinutes: number) => {
    try {
      // Create new session
      const newSession: RevisionSession = {
        id: Date.now().toString(),
        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,
        subject: selectedTopic.subject,
        duration: actualMinutes,
        rating,
        date: new Date(),
        notes,
      };
      
      setSessions(prev => [newSession, ...prev]);
      setShowTimer(false);
      
      toast({
        title: "Session completed! 🎉",
        description: `Logged ${actualMinutes}m for ${selectedTopic.title}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      });
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Easy': return 'text-emerald-600 bg-emerald-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Hard': return 'text-orange-600 bg-orange-50';
      case 'Again': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Focus Mode</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Topic Selection & Quick Start */}
          <div className="lg:col-span-2 space-y-6">
            {/* Topic Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-primary" />
                  <span>Select Topic to Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableTopics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground mb-4">No topics due for revision today.</p>
                    <Button onClick={() => navigate('/planner')}>
                      View All Topics
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableTopics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicSelect(topic)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedTopic?.id === topic.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline">{topic.subject}</Badge>
                                <Badge 
                                  variant={topic.dueStatus === 'Overdue' ? 'destructive' : 'secondary'}
                                >
                                  {topic.dueStatus}
                                </Badge>
                              </div>
                              <h4 className="font-semibold">{topic.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Cycle {topic.cycle} • Est. {topic.estimatedMinutes}m
                              </p>
                            </div>
                          </div>
                          {selectedTopic?.id === topic.id && (
                            <Badge className="bg-primary">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Start */}
            {selectedTopic && (
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ready to start?</h3>
                      <p className="text-muted-foreground">
                        {selectedTopic.title} • {selectedTopic.estimatedMinutes} minutes
                      </p>
                    </div>
                    <Button 
                      onClick={handleStartRevision}
                      size="lg"
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Play className="h-5 w-5" />
                      <span>Start Revision</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Today's Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{sessions.filter(s => 
                      s.date.toDateString() === new Date().toDateString()).length}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {sessions.filter(s => 
                        s.date.toDateString() === new Date().toDateString())
                        .reduce((acc, s) => acc + s.duration, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Set(sessions.filter(s => 
                        s.date.toDateString() === new Date().toDateString())
                        .map(s => s.topicId)).size}
                    </div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Session History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-muted-foreground text-sm">No sessions yet</p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div key={session.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {session.subject}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getRatingColor(session.rating)}`}
                              >
                                {session.rating}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm leading-tight">
                              {session.topicTitle}
                            </h4>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{session.duration}m</div>
                            <div className="text-xs text-muted-foreground">
                              {session.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Timer Dialog */}
      {selectedTopic && (
        <FocusTimer
          isOpen={showTimer}
          onClose={() => setShowTimer(false)}
          topic={selectedTopic}
          onComplete={handleTimerComplete}
        />
      )}
    </div>
  );
}