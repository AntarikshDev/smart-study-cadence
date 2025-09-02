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
import { Topic } from '@/types/revision';

interface ImportCSVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (topics: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

const sampleCSV = `subject,title,estimatedMinutes,weightage,difficulty,masteryLevel,mustWin
Mathematics,Differential Calculus,45,5,4,Intermediate,true
Physics,Quantum Mechanics,60,5,5,Beginner,true
Chemistry,Organic Reactions,30,4,3,Advanced,false
Biology,Cell Division,25,3,2,Intermediate,false`;

export const ImportCSVDialog = ({ isOpen, onClose, onImport }: ImportCSVDialogProps) => {
  const [csvContent, setCsvContent] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const parseCSV = useCallback((content: string) => {
    try {
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        setErrors(['CSV must have at least a header row and one data row']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['subject', 'title'];
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

        // Validate required fields
        if (!row.subject || !row.title) {
          newErrors.push(`Row ${i + 1}: Subject and title are required`);
          continue;
        }

        // Convert and validate numeric fields
        row.estimatedMinutes = parseInt(row.estimatedMinutes) || 30;
        row.weightage = Math.max(1, Math.min(5, parseInt(row.weightage) || 3));
        row.difficulty = Math.max(1, Math.min(5, parseInt(row.difficulty) || 3));
        row.masteryLevel = ['Beginner', 'Intermediate', 'Advanced', 'Mastered'].includes(row.masteryLevel) 
          ? row.masteryLevel : 'Beginner';
        row.mustWin = row.mustWin?.toLowerCase() === 'true';
        row.isArchived = false;
        row.firstStudied = new Date();

        validRows.push(row);
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

  const handleImport = () => {
    if (previewData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please provide valid CSV data first.",
        variant: "destructive",
      });
      return;
    }

    onImport(previewData);
    toast({
      title: "Topics imported successfully!",
      description: `Imported ${previewData.length} topic(s).`,
    });
    handleClose();
  };

  const handleClose = () => {
    setCsvContent('');
    setPreviewData([]);
    setErrors([]);
    setFile(null);
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
                    Upload a CSV file or paste CSV content with the following columns:
                  </p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><strong>Required:</strong> subject, title</p>
                    <p><strong>Optional:</strong> estimatedMinutes (default: 30), weightage (1-5, default: 3), 
                       difficulty (1-5, default: 3), masteryLevel (Beginner/Intermediate/Advanced/Mastered, default: Beginner), 
                       mustWin (true/false, default: false)</p>
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
              placeholder="subject,title,estimatedMinutes,weightage,difficulty,masteryLevel,mustWin&#10;Mathematics,Differential Calculus,45,5,4,Intermediate,true"
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
            disabled={previewData.length === 0 || errors.length > 0}
          >
            Import {previewData.length} Topic(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};