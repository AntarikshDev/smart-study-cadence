import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Settings, 
  FileText,
  Target,
  Book,
  Star
} from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { Topic } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Planner() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [dailyCapacity, setDailyCapacity] = useState(45);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await mockApi.getTopics();
      setTopics(topicsData);
    } catch (error) {
      toast({
        title: "Error loading topics",
        description: "Failed to load topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await mockApi.createTopic(topicData);
      await loadTopics();
      toast({
        title: "Topic added successfully!",
        description: `${topicData.title} has been added to your revision plan.`,
      });
    } catch (error) {
      toast({
        title: "Error adding topic",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportTopics = async (importedTopics: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      for (const topic of importedTopics) {
        await mockApi.createTopic(topic);
      }
      await loadTopics();
    } catch (error) {
      toast({
        title: "Error importing topics",
        description: "Failed to import some topics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || topic.subject === filterSubject;
    return matchesSearch && matchesSubject && !topic.isArchived;
  });

  const subjects = [...new Set(topics.map(t => t.subject))];

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'destructive';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'success';
      case 'Mastered': return 'default';
      default: return 'secondary';
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < difficulty ? 'text-warning fill-warning' : 'text-muted'}`}
      />
    ));
  };

  if (loading) {
    return <PlannerSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span>Revision Planner</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your topics, schedules, and revision cycles
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Label htmlFor="capacity" className="text-sm">Capacity:</Label>
              <div className="flex items-center space-x-1">
                <Input
                  id="capacity"
                  type="number"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(Number(e.target.value))}
                  className="w-16"
                  min="15"
                  max="480"
                />
                <span className="text-sm text-muted-foreground">min/day</span>
              </div>
            </div>

            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Book className="h-5 w-5" />
              <span>Topics</span>
              <Badge variant="secondary">{filteredTopics.length} items</Badge>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Book className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No topics found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery ? 'Try adjusting your search' : 'Add your first topic to get started'}
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-3">Topic</div>
                <div className="col-span-2">Subject</div>
                <div className="col-span-1">Est. Min</div>
                <div className="col-span-2">Mastery</div>
                <div className="col-span-1">Difficulty</div>
                <div className="col-span-1">Weight</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredTopics.map((topic) => (
                <div 
                  key={topic.id}
                  className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-3">
                    <div className="font-medium text-foreground">{topic.title}</div>
                    {topic.firstStudied && (
                      <div className="text-xs text-muted-foreground">
                        First studied: {topic.firstStudied.toLocaleDateString()}
                      </div>
                    )}
                    {topic.mustWin && (
                      <Badge variant="warning" className="mt-1 text-xs">
                        Must-Win
                      </Badge>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-xs">
                      {topic.subject}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{topic.estimatedMinutes}m</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Badge variant={getMasteryColor(topic.masteryLevel)} className="text-xs">
                      {topic.masteryLevel}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="flex items-center space-x-0.5">
                      {getDifficultyStars(topic.difficulty)}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{topic.weightage}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Book className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Topics</span>
            </div>
            <div className="text-2xl font-bold mt-2">{topics.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Must-Win</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {topics.filter(t => t.mustWin).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {topics.reduce((sum, t) => sum + t.estimatedMinutes, 0)}m
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Avg Difficulty</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {topics.length > 0 
                ? (topics.reduce((sum, t) => sum + t.difficulty, 0) / topics.length).toFixed(1)
                : '0'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const PlannerSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
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