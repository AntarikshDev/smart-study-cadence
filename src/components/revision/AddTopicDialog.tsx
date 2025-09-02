import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Topic } from '@/types/revision';

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

export const AddTopicDialog = ({ isOpen, onClose, onAdd }: AddTopicDialogProps) => {
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    firstStudied: new Date(),
    estimatedMinutes: 30,
    weightage: 3,
    difficulty: 3,
    masteryLevel: 'Beginner' as const,
    mustWin: false,
    isArchived: false,
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.title) {
      return;
    }

    onAdd(formData);
    
    // Reset form
    setFormData({
      subject: '',
      title: '',
      firstStudied: new Date(),
      estimatedMinutes: 30,
      weightage: 3,
      difficulty: 3,
      masteryLevel: 'Beginner',
      mustWin: false,
      isArchived: false,
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      title: '',
      firstStudied: new Date(),
      estimatedMinutes: 30,
      weightage: 3,
      difficulty: 3,
      masteryLevel: 'Beginner',
      mustWin: false,
      isArchived: false,
    });
    onClose();
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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