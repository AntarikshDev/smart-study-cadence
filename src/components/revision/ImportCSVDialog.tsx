import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Topic, RevisionFrequency } from '@/types/revision';

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

const getRevisionFrequencyFromInput = (input: string | number, weightage: number, difficulty: number): RevisionFrequency => {
  // Handle numeric input (3, 4, 5)
  if (typeof input === 'number' || /^\d+$/.test(input)) {
    const num = typeof input === 'number' ? input : parseInt(input);
    if (num === 3) return revisionFrequencies[0]; // Light (3 revisions)
    if (num === 4) return revisionFrequencies[1]; // Standard (4 revisions)  
    if (num === 5) return revisionFrequencies[2]; // Intensive (5 revisions)
  }
  
  // Handle string input
  const normalizedString = input?.toString().toLowerCase();
  if (normalizedString === 'light') return revisionFrequencies[0];
  if (normalizedString === 'standard') return revisionFrequencies[1];
  if (normalizedString === 'intensive') return revisionFrequencies[2];
  
  // Auto-calculate based on weightage and difficulty if no valid input
  const score = weightage + difficulty;
  if (score <= 4) return revisionFrequencies[0]; // Light
  if (score <= 7) return revisionFrequencies[1]; // Standard
  return revisionFrequencies[2]; // Intensive
};

interface ImportCSVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (topics: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

const sampleCSV = `subject,topic_title,sub_topic,estimated_minutes,weightage,difficulty,mastery_level,must_win,revision_frequency,first_studied,due_date,notes
Mathematics,"Differential Calculus","Chain Rule",45,5,4,Intermediate,true,5,2024-01-15,2024-01-22,"Focus on composite functions"
Physics,"Quantum Mechanics",,60,5,5,Beginner,true,5,2024-01-10,2024-01-17,"Review experiments"
Chemistry,"Organic Chemistry","Reaction Mechanisms",30,4,3,Advanced,false,4,2024-01-12,2024-01-19,"Practice mechanisms"
Biology,"Cell Biology",,25,3,2,Intermediate,false,3,2024-01-08,2024-01-15,"Understand phases"`;

export const ImportCSVDialog = ({ isOpen, onClose, onImport }: ImportCSVDialogProps) => {
  const [csvContent, setCsvContent] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const parseCSV = useCallback((content: string) => {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        setErrors(['CSV must have at least a header row and one data row']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const requiredHeaders = ['subject', 'topic_title']; // Only subject and topic_title are required
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }

      const validRows: any[] = [];
      const newErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          newErrors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Validate required fields (only subject and topic_title are required)
        if (!row.subject || !row.topic_title) {
          newErrors.push(`Row ${i + 1}: Subject and topic_title are required`);
          continue;
        }

        // Parse dates if provided
        const firstStudiedDate = row.first_studied ? new Date(row.first_studied) : new Date();
        const dueDateParsed = row.due_date ? new Date(row.due_date) : null;

        // Map CSV fields to Topic interface
        const processedRow = {
          subject: row.subject?.replace(/"/g, ''),
          title: row.topic_title?.replace(/"/g, ''),
          subTopic: row.sub_topic?.replace(/"/g, '') || '', // Optional field
          estimatedMinutes: parseInt(row.estimated_minutes) || 30,
          weightage: Math.max(1, Math.min(5, parseInt(row.weightage) || 3)),
          difficulty: Math.max(1, Math.min(5, parseInt(row.difficulty) || 3)),
          masteryLevel: ['Beginner', 'Intermediate', 'Advanced', 'Mastered'].includes(row.mastery_level) 
            ? row.mastery_level : 'Beginner',
          mustWin: row.must_win?.toLowerCase() === 'true',
          isArchived: false,
          firstStudied: firstStudiedDate,
          dueDate: dueDateParsed,
          notes: row.notes?.replace(/"/g, '') || '',
          revisionFrequency: getRevisionFrequencyFromInput(row.revision_frequency, parseInt(row.weightage) || 3, parseInt(row.difficulty) || 3)
        };

        validRows.push(processedRow);
      }

      setErrors(newErrors);
      setPreviewData(validRows);
    } catch (error) {
      setErrors(['Failed to parse CSV. Please check the format.']);
      setPreviewData([]);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        parseCSV(content);
      };
      reader.readAsText(uploadedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleTextChange = (content: string) => {
    setCsvContent(content);
    parseCSV(content);
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please provide valid CSV data first.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      await onImport(previewData);
      toast({
        title: "Topics imported successfully!",
        description: `Imported ${previewData.length} topic(s).`,
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to import topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setCsvContent('');
    setPreviewData([]);
    setErrors([]);
    setFile(null);
    setImporting(false);
    onClose();
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-topics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Topics from CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span>CSV Format Instructions</span>
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a comprehensive CSV file with topic and revision data:
                  </p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><strong>Required:</strong> subject, topic_title</p>
                    <p><strong>Optional:</strong> sub_topic, estimated_minutes (default: 30), weightage (1-5, default: 3), 
                       difficulty (1-5, default: 3), mastery_level (Beginner/Intermediate/Advanced/Mastered, default: Beginner), 
                       must_win (true/false, default: false), revision_frequency (3/4/5 for Light/Standard/Intensive, auto-calculated),
                       first_studied (YYYY-MM-DD), due_date (YYYY-MM-DD), notes</p>
                    <p><strong>Note:</strong> Subjects are automatically extracted from the subject column to populate dropdowns.</p>
                  </div>
                </div>
                <Button onClick={downloadSample} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="csvContent">Or Paste CSV Content</Label>
            <Textarea
              id="csvContent"
              value={csvContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="subject,topic_title,sub_topic,estimated_minutes,weightage,difficulty,mastery_level,must_win,revision_frequency,first_studied,due_date,notes&#10;Mathematics,Differential Calculus,Chain Rule,45,5,4,Intermediate,true,5,2024-01-15,2024-01-22,Focus on composite functions&#10;Physics,Quantum Mechanics,,60,5,5,Beginner,true,5,2024-01-10,2024-01-17,Review experiments"
              className="min-h-32 font-mono text-sm"
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="border-destructive/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive mb-2">Import Errors</h4>
                    <ul className="text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-destructive">• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Preview ({previewData.length} topic(s))</span>
                  </h4>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {previewData.slice(0, 10).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{topic.subject}</Badge>
                        <span className="font-medium">{topic.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{topic.estimatedMinutes}m</span>
                        <span>•</span>
                        <span>W{topic.weightage}</span>
                        <span>•</span>
                        <span>D{topic.difficulty}</span>
                        {topic.mustWin && <Badge variant="secondary" className="text-xs">Must-Win</Badge>}
                      </div>
                    </div>
                  ))}
                  {previewData.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {previewData.length - 10} more topic(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={previewData.length === 0 || errors.length > 0 || importing}
          >
            {importing ? 'Importing...' : `Import ${previewData.length} Topic(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};