import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Topic } from '@/types/revision';

interface EditTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  onSave: (topicId: string, updates: Partial<Topic>) => Promise<void>;
}

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
  'History', 'Geography', 'Computer Science', 'Economics', 'Psychology'
];

const masteryLevels = ['Beginner', 'Intermediate', 'Advanced', 'Mastered'];

export const EditTopicDialog = ({ isOpen, onClose, topic, onSave }: EditTopicDialogProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    firstStudied: new Date(),
    estimatedMinutes: 30,
    weightage: 3,
    difficulty: 3,
    masteryLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastered',
    mustWin: false,
    isArchived: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (topic) {
      setFormData({
        subject: topic.subject,
        title: topic.title,
        firstStudied: topic.firstStudied,
        estimatedMinutes: topic.estimatedMinutes,
        weightage: topic.weightage,
        difficulty: topic.difficulty,
        masteryLevel: topic.masteryLevel,
        mustWin: topic.mustWin,
        isArchived: topic.isArchived,
      });
    }
  }, [topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.title || !topic) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(topic.id, formData);
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!topic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Edit Topic</span>
          </DialogTitle>
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

          {/* Topic Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Topic Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Differential Calculus, Quantum Mechanics"
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
              <Label htmlFor="weightage">Weightage (1-5)</Label>
              <Select 
                value={formData.weightage.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, weightage: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num <= 2 ? '(Low)' : num <= 3 ? '(Medium)' : '(High)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Select 
                value={formData.difficulty.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num <= 2 ? '(Easy)' : num <= 3 ? '(Medium)' : '(Hard)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Archive Toggle */}
            <div className="space-y-2">
              <Label htmlFor="isArchived">Archive Topic</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="isArchived"
                  checked={formData.isArchived}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isArchived: checked }))}
                />
                <Label htmlFor="isArchived" className="text-sm text-muted-foreground">
                  Hide from active revision
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};