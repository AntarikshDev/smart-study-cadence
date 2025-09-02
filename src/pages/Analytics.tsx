import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/revision/KpiCard';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Flame, 
  AlertTriangle,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { AnalyticsData } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await mockApi.getAnalytics(timeRange);
      setData(analyticsData);
    } catch (error) {
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span>Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and identify improvement areas
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">This Week</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 3 Months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KpiCard
          title="On-time Rate"
          value={`${data.kpis.onTimeRate}%`}
          icon={Target}
          delta={{ value: 5, isPositive: true }}
          className="border-l-4 border-l-success"
        />
        <KpiCard
          title="Avg Lateness"
          value={`${data.kpis.avgLateness}d`}
          icon={AlertTriangle}
          delta={{ value: -0.3, isPositive: true }}
          className="border-l-4 border-l-warning"
        />
        <KpiCard
          title="Weekly Minutes"
          value={`${data.kpis.weeklyMinutes}m`}
          icon={Clock}
          sparkline={data.kpis.weeklyMinutesSparkline}
          className="border-l-4 border-l-primary"
        />
        <KpiCard
          title="Backlog Size"
          value={data.backlogBurndown[data.backlogBurndown.length - 1]?.count || 0}
          icon={TrendingUp}
          delta={{ value: -15, isPositive: true }}
        />
        <KpiCard
          title="Current Streak"
          value={`${data.kpis.currentStreak}d`}
          icon={Flame}
          className="border-l-4 border-l-destructive"
        />
        <KpiCard
          title="Snooze Rate"
          value={`${data.kpis.snoozeCount}%`}
          icon={Calendar}
          delta={{ value: -2, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backlog Burndown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Backlog Burndown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1">
              {data.backlogBurndown.map((point, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-primary/20 rounded-t-sm w-full transition-all duration-500 hover:bg-primary/30"
                    style={{ 
                      height: `${Math.max(8, (point.count / Math.max(...data.backlogBurndown.map(p => p.count))) * 240)}px` 
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {point.date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Load Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-warning" />
              <span>14-Day Load Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1">
              {data.loadForecast.map((point, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className={`rounded-t-sm w-full transition-all duration-500 ${
                      point.minutes > 90 
                        ? 'bg-destructive/40 hover:bg-destructive/50' 
                        : point.minutes > 60 
                        ? 'bg-warning/40 hover:bg-warning/50'
                        : 'bg-success/40 hover:bg-success/50'
                    }`}
                    style={{ 
                      height: `${Math.max(8, (point.minutes / 120) * 240)}px` 
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {point.date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mastery Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-accent" />
              <span>Mastery Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.masteryDistribution.map((item, index) => {
                const total = data.masteryDistribution.reduce((sum, i) => sum + i.count, 0);
                const percentage = Math.round((item.count / total) * 100);
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`h-4 w-4 rounded ${
                          item.level === 'Beginner' ? 'bg-destructive' :
                          item.level === 'Intermediate' ? 'bg-warning' :
                          item.level === 'Advanced' ? 'bg-success' :
                          'bg-primary'
                        }`}
                      />
                      <span className="text-sm font-medium">{item.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Snooze Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Snooze Pattern</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {data.snoozeHeatmap.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    {day.day}
                  </div>
                  <div 
                    className={`h-12 rounded flex items-center justify-center text-xs font-medium ${
                      day.count === 0 ? 'bg-muted text-muted-foreground' :
                      day.count <= 2 ? 'bg-success/20 text-success' :
                      day.count <= 4 ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {day.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Revised Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.mostRevisedTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{topic.topic}</span>
                  </div>
                  <Badge variant="secondary">
                    {topic.count} times
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.mostTimeSpentTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">{topic.topic}</span>
                  </div>
                  <Badge variant="secondary">
                    {Math.round(topic.minutes / 60)}h {topic.minutes % 60}m
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-48" />
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);