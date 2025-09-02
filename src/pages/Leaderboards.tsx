import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Target,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { LeaderboardEntry, ComparisonData } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Leaderboards() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subject');
  const [timeWindow, setTimeWindow] = useState('30d');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, timeWindow]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaderboardData, comparisonData] = await Promise.all([
        mockApi.getLeaderboard(activeTab, timeWindow),
        mockApi.getComparison(activeTab, 'current-user', timeWindow)
      ]);
      setLeaderboard(leaderboardData);
      setComparison(comparisonData);
    } catch (error) {
      toast({
        title: "Error loading leaderboards",
        description: "Failed to load leaderboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium">#{rank}</span>;
  };

  const getDelta = (value: number, compareValue: number) => {
    const delta = value - compareValue;
    if (delta > 0) return { icon: TrendingUp, color: 'text-success', value: `+${delta}` };
    if (delta < 0) return { icon: TrendingDown, color: 'text-destructive', value: delta.toString() };
    return { icon: Minus, color: 'text-muted-foreground', value: '0' };
  };

  if (loading) {
    return <LeaderboardsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span>Leaderboards</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare your progress with other students
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="text-sm">Anonymous</Label>
          </div>
          
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">This Week</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Panel */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Your Performance Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm font-medium text-muted-foreground mb-1">You</div>
                <div className="text-2xl font-bold text-primary">#{comparison.you.rank}</div>
                <div className="text-xs text-muted-foreground mt-1">{comparison.you.onTimeRate}% on-time</div>
              </div>
              
              <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/10">
                <div className="text-sm font-medium text-muted-foreground mb-1">Top 5%</div>
                <div className="text-2xl font-bold text-warning">#{comparison.topper.rank}</div>
                <div className="text-xs text-muted-foreground mt-1">{comparison.topper.onTimeRate}% on-time</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg border">
                <div className="text-sm font-medium text-muted-foreground mb-1">Average</div>
                <div className="text-2xl font-bold text-foreground">#{comparison.average.rank}</div>
                <div className="text-xs text-muted-foreground mt-1">{comparison.average.onTimeRate}% on-time</div>
              </div>
              
              <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                <div className="text-sm font-medium text-muted-foreground mb-1">Bottom 20%</div>
                <div className="text-2xl font-bold text-destructive">#{comparison.struggling.rank}</div>
                <div className="text-xs text-muted-foreground mt-1">{comparison.struggling.onTimeRate}% on-time</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-muted-foreground mb-2">Metric</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-primary mb-2">You</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-warning mb-2">Top 5%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-muted-foreground mb-2">Average</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-muted-foreground mb-2">vs Average</div>
              </div>
              
              {[
                { label: 'Weekly Minutes', key: 'weeklyMinutes', suffix: 'm' },
                { label: 'Avg Time/Rev', key: 'avgTimePerRevision', suffix: 'm' },
                { label: 'Consistency', key: 'consistency', suffix: '%' },
                { label: 'Coverage', key: 'coverage', suffix: '%' },
              ].map((metric) => {
                const delta = getDelta(
                  comparison.you[metric.key as keyof LeaderboardEntry] as number,
                  comparison.average[metric.key as keyof LeaderboardEntry] as number
                );
                
                return (
                  <div key={metric.key} className="contents">
                    <div className="text-left font-medium">{metric.label}</div>
                    <div className="text-center">{comparison.you[metric.key as keyof LeaderboardEntry]}{metric.suffix}</div>
                    <div className="text-center">{comparison.topper[metric.key as keyof LeaderboardEntry]}{metric.suffix}</div>
                    <div className="text-center">{comparison.average[metric.key as keyof LeaderboardEntry]}{metric.suffix}</div>
                    <div className={`text-center flex items-center justify-center space-x-1 ${delta.color}`}>
                      <delta.icon className="h-3 w-3" />
                      <span>{delta.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subject">By Subject</TabsTrigger>
          <TabsTrigger value="topic">By Topic</TabsTrigger>
          <TabsTrigger value="exam">By Exam</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Rankings</span>
                  <Badge variant="secondary">{leaderboard.length} students</Badge>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-2">Student</div>
                  <div className="col-span-1 text-center">On-time %</div>
                  <div className="col-span-1 text-center">Weekly Min</div>
                  <div className="col-span-1 text-center">Avg Time</div>
                  <div className="col-span-1 text-center">Consistency</div>
                  <div className="col-span-1 text-center">Coverage</div>
                </div>

                {/* Leaderboard Entries */}
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.id}
                    className={`grid grid-cols-8 gap-4 items-center py-3 rounded-lg transition-colors ${
                      entry.isCurrentUser 
                        ? 'bg-primary/5 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="col-span-1 flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="col-span-2">
                      <div className="font-medium text-foreground flex items-center space-x-2">
                        <span>{isAnonymous ? `Student ${entry.rank}` : entry.name}</span>
                        {entry.isCurrentUser && (
                          <Badge variant="default" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{entry.onTimeRate}%</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{entry.weeklyMinutes}m</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <span className="font-medium">{entry.avgTimePerRevision}m</span>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{entry.consistency}%</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <Badge 
                        variant={entry.coverage >= 80 ? 'success' : entry.coverage >= 60 ? 'warning' : 'destructive'}
                        className="text-xs"
                      >
                        {entry.coverage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span>Ways to Improve Your Ranking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/5 rounded-lg border border-success/10">
              <div className="font-medium text-success mb-2">Improve On-time Rate</div>
              <div className="text-sm text-muted-foreground">
                Stick to your revision schedule. Set reminders and plan ahead to avoid last-minute cramming.
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="font-medium text-primary mb-2">Increase Weekly Minutes</div>
              <div className="text-sm text-muted-foreground">
                Gradually increase your daily study time. Even 10 more minutes per day makes a difference.
              </div>
            </div>
            
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/10">
              <div className="font-medium text-warning mb-2">Boost Consistency</div>
              <div className="text-sm text-muted-foreground">
                Study a little every day rather than cramming. Consistent daily practice beats sporadic marathons.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const LeaderboardsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);