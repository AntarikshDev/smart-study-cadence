import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  FileSpreadsheet,
  Eye,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockStudents = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    totalTopics: 24,
    completedToday: 3,
    overdue: 2,
    onTimeRate: 85,
    weeklyMinutes: 450,
    lastActive: new Date('2024-01-05'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    totalTopics: 18,
    completedToday: 1,
    overdue: 5,
    onTimeRate: 62,
    weeklyMinutes: 280,
    lastActive: new Date('2024-01-04'),
    status: 'struggling'
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    totalTopics: 31,
    completedToday: 4,
    overdue: 0,
    onTimeRate: 94,
    weeklyMinutes: 680,
    lastActive: new Date('2024-01-05'),
    status: 'excellent'
  }
];

const mockSubjects = [
  { id: '1', name: 'Mathematics', topicCount: 45, activeStudents: 12 },
  { id: '2', name: 'Physics', topicCount: 38, activeStudents: 8 },
  { id: '3', name: 'Chemistry', topicCount: 42, activeStudents: 10 },
  { id: '4', name: 'Biology', topicCount: 35, activeStudents: 9 }
];

const AdminHub = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'subjects' | 'topics' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'subjects' | 'topics') => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const processFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    // Simulate file processing
    setTimeout(() => {
      toast({
        title: "Upload successful",
        description: `${uploadType} data has been imported successfully.`,
      });
      setUploadType(null);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-emerald-100 text-emerald-700">Excellent</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700">Active</Badge>;
      case 'struggling':
        return <Badge className="bg-red-100 text-red-700">Needs Help</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const downloadTemplate = (type: 'subjects' | 'topics') => {
    const templates = {
      subjects: 'subject_name,description,category\nMathematics,"Advanced mathematics topics",STEM\nPhysics,"Physics concepts and theories",STEM',
      topics: 'subject,topic_title,sub_topic,difficulty,estimated_minutes\nMathematics,"Calculus - Differentiation","Chain Rule",3,45\nPhysics,"Mechanics - Newton\'s Laws","First Law",2,30'
    };
    
    const blob = new Blob([templates[type]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revision Planner Admin Hub</h1>
          <p className="text-muted-foreground mt-1">
            Manage students, subjects, and analyze revision performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => downloadTemplate('subjects')}>
            <Download className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revisions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">On-time completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Student Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subject Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* Student Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Overview</CardTitle>
              <CardDescription>
                Monitor individual student progress and identify those who need support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Topics</TableHead>
                      <TableHead>Today</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>On-Time Rate</TableHead>
                      <TableHead>Weekly Minutes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>{student.totalTopics}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.completedToday}</Badge>
                        </TableCell>
                        <TableCell>
                          {student.overdue > 0 ? (
                            <Badge variant="destructive">{student.overdue}</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>{student.onTimeRate}%</TableCell>
                        <TableCell>{student.weeklyMinutes}m</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Student Details: {student.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Total Topics:</span>
                                      <span className="font-semibold">{student.totalTopics}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>On-Time Rate:</span>
                                      <span className="font-semibold">{student.onTimeRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Weekly Minutes:</span>
                                      <span className="font-semibold">{student.weeklyMinutes}m</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Status:</span>
                                      {getStatusBadge(student.status)}
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Last Active:</span>
                                        <span>{student.lastActive.toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Completed Today:</span>
                                        <span>{student.completedToday} topics</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Overdue Items:</span>
                                        <span className={student.overdue > 0 ? 'text-red-600' : 'text-green-600'}>
                                          {student.overdue} topics
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subject Management Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Subjects
                </CardTitle>
                <CardDescription>
                  Upload a CSV file containing subject information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => handleFileUpload('subjects')}
                    className="w-full"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Upload Subjects CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadTemplate('subjects')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  CSV should include: subject_name, description, category
                </div>
              </CardContent>
            </Card>

            {/* Upload Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Topics
                </CardTitle>
                <CardDescription>
                  Upload a CSV file containing topic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => handleFileUpload('topics')}
                    className="w-full"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Upload Topics CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadTemplate('topics')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  CSV should include: subject, topic_title, sub_topic, difficulty, estimated_minutes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Current Subjects</CardTitle>
              <CardDescription>
                Manage existing subjects and their associated topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topics Count</TableHead>
                      <TableHead>Active Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.topicCount}</TableCell>
                        <TableCell>{subject.activeStudents}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Overall platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">94.2%</div>
                    <div className="text-sm text-muted-foreground">Platform Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8.5h</div>
                    <div className="text-sm text-muted-foreground">Avg. Daily Study</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Student engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Active Users</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Active Users</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Session Time</span>
                    <span className="font-semibold">45m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure global settings for the revision planner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCapacity">Default Daily Capacity (minutes)</Label>
                  <Input id="defaultCapacity" type="number" defaultValue="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOverdue">Max Overdue Days</Label>
                  <Input id="maxOverdue" type="number" defaultValue="7" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={processFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AdminHub;