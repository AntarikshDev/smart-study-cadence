import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTopicDialog } from '@/components/revision/AddTopicDialog';
import { ImportCSVDialog } from '@/components/revision/ImportCSVDialog';
import { SettingsDialog } from '@/components/revision/SettingsDialog';
import { EditTopicDialog } from '@/components/revision/EditTopicDialog';
import { ScheduleDialog } from '@/components/revision/ScheduleDialog';
import { SnoozeFloatingButton } from '@/components/revision/SnoozeFloatingButton';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Settings, 
  FileText,
  Target,
  Book,
  Star,
  Upload,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { mockApi } from '@/lib/mockApi';
import { Topic } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function Planner() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [dailyCapacity, setDailyCapacity] = useState(45);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

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

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowEditDialog(true);
  };

  const handleViewSchedule = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowScheduleDialog(true);
  };

  const handleSaveEdit = async (topicId: string, updates: Partial<Topic>) => {
    try {
      await mockApi.updateTopic(topicId, updates);
      await loadTopics();
      toast({
        title: "Topic updated successfully!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating topic",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSnoozeAll = async (days: number, cascade: boolean) => {
    // Mock implementation - in real app would snooze all pending topics
    toast({
      title: "All topics snoozed! 😴",
      description: `All pending revisions snoozed for ${days} day(s).`,
    });
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || topic.subject === filterSubject;
    return matchesSearch && matchesSubject && !topic.isArchived;
  });

  const subjects = [...new Set(topics.map(t => t.subject))];
  const pendingTopics = topics.filter(t => !t.isArchived); // Mock pending count

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
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline" 
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-to-r from-white to-gray-50/50 border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                />
              </div>
            </div>
            
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-48 bg-white border-gray-200">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 z-50">
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Label htmlFor="capacity" className="text-sm font-medium">Revision Capacity:</Label>
              <div className="flex items-center space-x-1">
                <Input
                  id="capacity"
                  type="number"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(Number(e.target.value))}
                  className="w-16 bg-white border-gray-200"
                  min="15"
                  max="480"
                />
                <span className="text-sm text-muted-foreground">min/day</span>
              </div>
            </div>

            <Button 
              onClick={() => setShowSettingsDialog(true)}
              variant="outline" 
              size="icon"
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
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
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                >
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
                      <Button 
                        onClick={() => handleEditTopic(topic)}
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        onClick={() => handleViewSchedule(topic)}
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Schedule</span>
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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Book className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Topics</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-700">{topics.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Must-Win</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-orange-700">
              {topics.filter(t => t.mustWin).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Total Time</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-emerald-700">
              {topics.reduce((sum, t) => sum + t.estimatedMinutes, 0)}m
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Avg Difficulty</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-purple-700">
              {topics.length > 0 
                ? (topics.reduce((sum, t) => sum + t.difficulty, 0) / topics.length).toFixed(1)
                : '0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddTopicDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddTopic}
      />

      <ImportCSVDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportTopics}
      />

      <SettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />

      <EditTopicDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onSave={handleSaveEdit}
      />

      <ScheduleDialog
        isOpen={showScheduleDialog}
        onClose={() => {
          setShowScheduleDialog(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
      />

      {/* Snooze Floating Button */}
      <SnoozeFloatingButton 
        onSnooze={handleSnoozeAll}
        pendingCount={pendingTopics.length}
      />
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