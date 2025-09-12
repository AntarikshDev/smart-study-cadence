import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation
} from '@/store/api/revisionApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTopicDialog } from '@/components/revision/AddTopicDialog';
import { EditTopicDialog } from '@/components/revision/EditTopicDialog';
import { ImportCSVDialog } from '@/components/revision/ImportCSVDialog';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Filter, 
  Archive,
  Edit3,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  FileText,
  Clock,
  Target,
  Star
} from 'lucide-react';
import { Topic } from '@/types/revision';
import { toast } from '@/hooks/use-toast';

export default function TopicsManager() {
  const navigate = useNavigate();
  const { data: topics = [], isLoading, error } = useGetTopicsQuery();
  const [addTopic] = useAddTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMastery, setSelectedMastery] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Show error toast when error occurs
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load topics",
      variant: "destructive",
    });
  }

const handleAddTopic = async (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTopic(topicData).unwrap();
      toast({
        title: "Topic added",
        description: "New topic has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditTopic = async (topicId: string, updates: Partial<Topic>) => {
    try {
      await updateTopic({ id: topicId, updates }).unwrap();
      toast({
        title: "Topic updated",
        description: "Topic has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteTopic(topicId).unwrap();
      toast({
        title: "Topic deleted",
        description: "Topic has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportTopics = async (importedTopics: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      const promises = importedTopics.map(topic => addTopic(topic).unwrap());
      await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  };

  const openEditDialog = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowEditDialog(true);
  };

  // Filter topics based on search and filters
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (topic.subTopic && topic.subTopic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || topic.subject === selectedSubject;
    const matchesMastery = selectedMastery === 'all' || topic.masteryLevel === selectedMastery;
    const matchesArchived = showArchived ? true : !topic.isArchived;

    return matchesSearch && matchesSubject && matchesMastery && matchesArchived;
  });

  // Get unique subjects for filter
  const subjects = [...new Set(topics.map(topic => topic.subject))];

if (isLoading && topics.length === 0) {
    return <TopicsManagerSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span>Topics Manager</span>
            <Badge variant="secondary" className="ml-2">
              {filteredTopics.length} topics
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your revision topics and study materials
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </Button>
          
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Topic</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Subject Filter */}
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mastery Filter */}
            <Select value={selectedMastery} onValueChange={setSelectedMastery}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Mastery Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mastery Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Mastered">Mastered</SelectItem>
              </SelectContent>
            </Select>

            {/* Show Archived */}
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center space-x-2"
            >
              <Archive className="h-4 w-4" />
              <span>{showArchived ? 'Hide' : 'Show'} Archived</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className={`transition-all hover:shadow-md ${topic.isArchived ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {topic.subject}
                      </Badge>
                      {topic.mustWin && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Must-Win
                        </Badge>
                      )}
                      {topic.isArchived && (
                        <Badge variant="destructive" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                      {topic.title}
                    </h3>
                    {topic.subTopic && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {topic.subTopic}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(topic)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{topic.estimatedMinutes}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span>W{topic.weightage}/D{topic.difficulty}</span>
                  </div>
                </div>

                {/* Mastery Level */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Mastery:</span>
                  <Badge 
                    variant={
                      topic.masteryLevel === 'Mastered' ? 'success' :
                      topic.masteryLevel === 'Advanced' ? 'default' :
                      topic.masteryLevel === 'Intermediate' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {topic.masteryLevel}
                  </Badge>
                </div>

                {/* Revision Frequency */}
                <div className="text-xs text-muted-foreground">
                  <span>Frequency: </span>
                  <span className="font-medium">{topic.revisionFrequency.type}</span>
                  <span> ({topic.revisionFrequency.intervals.length} cycles)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTopics.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No topics found</h3>
            <p className="text-muted-foreground mb-4">
              {topics.length === 0 ? 
                "Get started by adding your first topic or importing from CSV." :
                "Try adjusting your filters or search terms."
              }
            </p>
            {topics.length === 0 && (
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Topic
                </Button>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddTopicDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddTopic}
      />

      <EditTopicDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        topic={selectedTopic}
        onSave={handleEditTopic}
      />

      <ImportCSVDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportTopics}
      />
    </div>
  );
}

const TopicsManagerSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>

    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);