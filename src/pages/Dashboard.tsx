import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTopics, fetchSchedules, snoozeSchedule } from '@/store/slices/revisionSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/revision/KpiCard';
import { TopicCard } from '@/components/revision/TopicCard';
import { MotivationalSection } from '@/components/revision/MotivationalSection';
import { SnoozeFloatingButton } from '@/components/revision/SnoozeFloatingButton';
import { DashboardData, TopicCardData } from '@/types/revision';
import { 
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,  
  TrendingUp,
  Timer,
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { topics, schedules, loading, error } = useAppSelector((state) => state.revision);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchTopics()).unwrap(),
        dispatch(fetchSchedules()).unwrap()
      ]);
      
      // Process data to create dashboard structure
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // This would typically come from the backend as a computed dashboard endpoint
      const mockDashboardData: DashboardData = {
        date: today,
        dueToday: [], // Will be populated from topics/schedules
        overdueCount: 0,
        completedToday: 0,
        weeklyMinutes: 0,
        currentStreak: 0,
        bestStreak: 0,
        onTimeRate: 0,
        upcomingDays: []
      };
      
      setDashboardData(mockDashboardData);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartRevision = (topicId: string) => {
    navigate(`/focus/${topicId}`);
  };

  const handleSnooze = async (scheduleId: string, days: number, cascade: boolean) => {
    try {
      await dispatch(snoozeSchedule({ scheduleId, days, cascade })).unwrap();
      toast({
        title: "Topic snoozed",
        description: `Snoozed for ${days} day(s)${cascade ? ' with cascade' : ''}`,
      });
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to snooze topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewSchedule = (topicId: string) => {
    navigate(`/planner?topic=${topicId}`);
  };

  const handleSnoozeAll = async (days: number, cascade: boolean) => {
    try {
      // Snooze all pending topics
      const snoozePromises = (dashboardData?.dueToday || []).map(topic =>
        dispatch(snoozeSchedule({ scheduleId: topic.scheduleId, days, cascade })).unwrap()
      );
      await Promise.all(snoozePromises);
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to snooze topics. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const data = dashboardData;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const pendingCount = data.dueToday.length + data.overdueCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span>Today's Revisions</span>
            <Badge variant="secondary" className="ml-2">
              {data.dueToday.length} items
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/focus')}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
        >
          <Zap className="h-4 w-4" />
          <span>Focus Mode</span>
        </Button>
      </div>

      {/* Motivational Section */}
      <MotivationalSection 
        currentStreak={data.currentStreak} 
        bestStreak={data.bestStreak} 
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Due Today"
          value={data.dueToday.length}
          icon={Clock}
          className="border-l-4 border-l-warning"
        />
        <KpiCard
          title="Overdue"
          value={data.overdueCount}
          icon={Target}
          className="border-l-4 border-l-destructive"
        />
        <KpiCard
          title="Completed"
          value={data.completedToday}
          icon={CheckCircle2}
          className="border-l-4 border-l-success"
        />
        <KpiCard
          title="Weekly Min"
          value={`${data.weeklyMinutes}m`}
          icon={TrendingUp}
          sparkline={[45, 60, 30, 75, 90, 45, 35]}
        />
        <KpiCard
          title="On-time Rate"
          value={`${data.onTimeRate}%`}
          icon={Target}
          delta={{ value: 5, isPositive: true }}
        />
        <KpiCard
          title="Streak"
          value={`${data.currentStreak}/${data.bestStreak}`}
          icon={Flame}
          className="border-l-4 border-l-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-primary" />
                <span>Today's Queue</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.dueToday.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-success animate-pulse-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">🎉 All clear!</h3>
                      <p className="text-muted-foreground mt-1">Nothing due today. Great job!</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => navigate('/planner')}>
                        View Upcoming
                      </Button>
                      <Button variant="outline">
                        Explore Weak Areas
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {data.dueToday.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onStart={handleStartRevision}
                      onSnooze={handleSnooze}
                      onViewSchedule={handleViewSchedule}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/planner')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingDays.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {day.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.topicCount} topics
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {day.totalMinutes}m
                      </div>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (day.totalMinutes / 120) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Smart Coach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Smart Coach</span>
                <Badge variant="secondary" className="text-xs">AI</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Priority: Physics - Quantum Mechanics
                  </div>
                  <div className="text-xs text-muted-foreground">
                    High weightage + overdue + low mastery
                  </div>
                </div>
                
                <div className="p-3 bg-warning/5 rounded-lg border border-warning/10">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Consider: Math - Differential Calculus
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Must-win topic due today
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Snooze Floating Button */}
      <SnoozeFloatingButton 
        onSnooze={handleSnoozeAll}
        pendingCount={pendingCount}
      />
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-6 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);