import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Topic, RevisionFrequency } from '@/types/revision';
import { getTopicsBySubject } from '@/data/topicData';

interface AddTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
  'History', 'Geography', 'Computer Science', 'Economics', 'Psychology'
];

const masteryLevels = ['Beginner', 'Intermediate', 'Advanced', 'Mastered'];

const revisionFrequencies: RevisionFrequency[] = [
  {
    type: 'Light',
    intervals: [7, 21, 60],
    description: '3 revisions over 2 months - Good for easier topics'
  },
  {
    type: 'Standard',
    intervals: [7, 14, 21, 28],
    description: '4 revisions over 1 month - Balanced approach'
  },
  {
    type: 'Intensive',
    intervals: [3, 7, 14, 21, 28],
    description: '5 revisions over 1 month - Best for difficult/critical topics'
  }
];

const getWeightageDescription = (value: number) => {
  switch (value) {
    case 1: return 'Minor topic - Low exam importance';
    case 2: return 'Secondary - Some exam relevance';
    case 3: return 'Important - Moderate exam importance';
    case 4: return 'High priority - High exam importance';
    case 5: return 'Critical - Essential for exam success';
    default: return '';
  }
};

const getDifficultyDescription = (value: number) => {
  switch (value) {
    case 1: return 'Very easy - Quick to understand and remember';
    case 2: return 'Easy - Straightforward with minimal practice';
    case 3: return 'Moderate - Needs regular practice';
    case 4: return 'Hard - Challenging, needs focused effort';
    case 5: return 'Very hard - Extremely challenging, needs intensive study';
    default: return '';
  }
};

const getRecommendedFrequency = (weightage: number, difficulty: number): RevisionFrequency => {
  const score = weightage + difficulty;
  if (score <= 4) return revisionFrequencies[0]; // Light
  if (score <= 7) return revisionFrequencies[1]; // Standard
  return revisionFrequencies[2]; // Intensive
};

export const AddTopicDialog = ({ isOpen, onClose, onAdd }: AddTopicDialogProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    subTopic: '',
    firstStudied: new Date(),
    estimatedMinutes: 30,
    weightage: 3,
    difficulty: 3,
    masteryLevel: 'Beginner' as const,
    mustWin: false,
    isArchived: false,
    revisionFrequency: revisionFrequencies[1], // Default to Standard
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.title || !formData.subTopic) {
      return;
    }

    onAdd(formData);
    
    // Reset form
    setFormData({
      subject: '',
      title: '',
      subTopic: '',
      firstStudied: new Date(),
      estimatedMinutes: 30,
      weightage: 3,
      difficulty: 3,
      masteryLevel: 'Beginner',
      mustWin: false,
      isArchived: false,
      revisionFrequency: revisionFrequencies[1],
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      title: '',
      subTopic: '',
      firstStudied: new Date(),
      estimatedMinutes: 30,
      weightage: 3,
      difficulty: 3,
      masteryLevel: 'Beginner',
      mustWin: false,
      isArchived: false,
      revisionFrequency: revisionFrequencies[1],
    });
    onClose();
  };

  // Auto-update revision frequency based on weightage and difficulty
  const handleWeightageChange = (value: number) => {
    const newFormData = { ...formData, weightage: value };
    const recommended = getRecommendedFrequency(value, formData.difficulty);
    setFormData({ ...newFormData, revisionFrequency: recommended });
  };

  const handleDifficultyChange = (value: number) => {
    const newFormData = { ...formData, difficulty: value };
    const recommended = getRecommendedFrequency(formData.weightage, value);
    setFormData({ ...newFormData, revisionFrequency: recommended });
  };

  // Get available topics based on selected subject
  const availableTopics = useMemo(() => {
    if (!formData.subject) return [];
    return getTopicsBySubject(formData.subject).map(topic => ({
      label: topic,
      value: topic
    }));
  }, [formData.subject]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mastery Level */}
            <div className="space-y-2">
              <Label htmlFor="masteryLevel">Mastery Level</Label>
              <Select 
                value={formData.masteryLevel} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, masteryLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {masteryLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic Title - Searchable Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="title">Topic Title *</Label>
            <Combobox
              options={availableTopics}
              value={formData.title}
              onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder={formData.subject ? "Search or select topic..." : "Select subject first"}
              searchPlaceholder="Search topics..."
              emptyMessage="No topics found for this subject."
              className="w-full"
            />
          </div>

          {/* Sub Topic */}
          <div className="space-y-2">
            <Label htmlFor="subTopic">Sub Topic *</Label>
            <Input
              id="subTopic"
              value={formData.subTopic}
              onChange={(e) => setFormData(prev => ({ ...prev, subTopic: e.target.value }))}
              placeholder="e.g., Chain Rule, Wave-Particle Duality"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Studied Date */}
            <div className="space-y-2">
              <Label>First Studied Date</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.firstStudied && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.firstStudied ? format(formData.firstStudied, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.firstStudied}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, firstStudied: date || new Date() }));
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Minutes */}
            <div className="space-y-2">
              <Label htmlFor="estimatedMinutes">Estimated Minutes</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min="5"
                max="180"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 30 }))}
              />
            </div>

            {/* Weightage */}
            <div className="space-y-2">
              <Label htmlFor="weightage" className="flex items-center gap-2">
                Exam Importance (1-5)
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <p className="text-sm">How important is this topic for your exam?</p>
                  </PopoverContent>
                </Popover>
              </Label>
              <Select 
                value={formData.weightage.toString()} 
                onValueChange={(value) => handleWeightageChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getWeightageDescription(formData.weightage)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="flex items-center gap-2">
                Learning Difficulty (1-5)
                <Popover>
                  <PopoverTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <p className="text-sm">How challenging is this topic to understand and master?</p>
                  </PopoverContent>
                </Popover>
              </Label>
              <Select 
                value={formData.difficulty.toString()} 
                onValueChange={(value) => handleDifficultyChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getDifficultyDescription(formData.difficulty)}
              </p>
            </div>

            {/* Must Win Toggle */}
            <div className="space-y-2">
              <Label htmlFor="mustWin">Must-Win Topic</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="mustWin"
                  checked={formData.mustWin}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mustWin: checked }))}
                />
                <Label htmlFor="mustWin" className="text-sm text-muted-foreground">
                  Critical for exam success
                </Label>
              </div>
            </div>
          </div>

          {/* Revision Frequency */}
          <div className="space-y-4">
            <Label>Revision Frequency</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {revisionFrequencies.map((freq) => (
                <Card 
                  key={freq.type}
                  className={cn(
                    "cursor-pointer transition-all border-2 p-3",
                    formData.revisionFrequency.type === freq.type
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, revisionFrequency: freq }))}
                >
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{freq.type}</h4>
                        <Badge variant="outline">{freq.intervals.length} revisions</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{freq.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {freq.intervals.map((interval, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {interval}d
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {formData.weightage >= 4 || formData.difficulty >= 4 ? (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-blue-600">
                  <HelpCircle className="h-4 w-4 mt-0.5" />
                </div>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">Recommended: Intensive</p>
                  <p className="text-blue-600">
                    Based on high importance/difficulty, intensive revision is recommended for better retention.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Topic
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};