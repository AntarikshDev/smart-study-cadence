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
  Trash2,
  Activity,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Timer,
  Brain,
  Zap,
  TrendingDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KpiCard } from '@/components/revision/KpiCard';

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

// Mock comprehensive analytics data
const mockSystemAnalytics = {
  totalStudents: 127,
  activeStudents: 89,
  totalSubjects: 12,
  totalTopics: 245,
  dailyRevisions: 1247,
  weeklyRevisions: 8734,
  avgPerformance: 84,
  platformUptime: 99.2,
  avgDailyStudyTime: 8.5,
  avgSessionTime: 45,
  completionRate: 76,
  onTimeRate: 84,
  strugglingStudents: 18,
  excellentStudents: 32,
};

const mockEngagementData = [
  { day: 'Monday', active: 89, sessions: 234, minutes: 10450 },
  { day: 'Tuesday', active: 92, sessions: 267, minutes: 11230 },
  { day: 'Wednesday', active: 85, sessions: 198, minutes: 9870 },
  { day: 'Thursday', active: 94, sessions: 289, minutes: 12100 },
  { day: 'Friday', active: 87, sessions: 213, minutes: 9560 },
  { day: 'Saturday', active: 76, sessions: 167, minutes: 7890 },
  { day: 'Sunday', active: 68, sessions: 134, minutes: 6450 },
];

const mockSubjectPerformance = [
  { subject: 'Mathematics', students: 45, avgScore: 78, completion: 82, difficulty: 4.2 },
  { subject: 'Physics', students: 38, avgScore: 71, completion: 76, difficulty: 4.5 },
  { subject: 'Chemistry', students: 42, avgScore: 84, completion: 88, difficulty: 3.8 },
  { subject: 'Biology', students: 35, avgScore: 89, completion: 92, difficulty: 3.2 },
  { subject: 'Computer Science', students: 28, avgScore: 86, completion: 90, difficulty: 3.9 },
];

const mockPerformanceTrends = [
  { week: 'Week 1', onTime: 78, completion: 82, engagement: 85 },
  { week: 'Week 2', onTime: 81, completion: 79, engagement: 88 },
  { week: 'Week 3', onTime: 79, completion: 84, engagement: 82 },
  { week: 'Week 4', onTime: 84, completion: 87, engagement: 91 },
];

const mockLeaderboardInsights = {
  topPerformers: [
    { name: 'Alice Johnson', score: 95, streak: 12, topics: 24 },
    { name: 'Carol Davis', score: 94, streak: 8, topics: 31 },
    { name: 'David Wilson', score: 92, streak: 15, topics: 19 },
    { name: 'Emma Brown', score: 90, streak: 6, topics: 28 },
    { name: 'Frank Miller', score: 88, streak: 10, topics: 22 },
  ],
  struggling: [
    { name: 'Bob Smith', score: 62, overdue: 5, needsHelp: true },
    { name: 'Grace Lee', score: 58, overdue: 8, needsHelp: true },
    { name: 'Henry Clark', score: 54, overdue: 12, needsHelp: true },
  ],
  averageMetrics: {
    score: 76,
    streak: 4.2,
    weeklyMinutes: 312,
    completionRate: 78
  }
};

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
      topics: `subject,topic_title,sub_topic,estimated_minutes,weightage,difficulty,mastery_level,must_win,revision_frequency
Mathematics,"Differential Calculus","Chain Rule",45,5,4,Intermediate,true,Intensive
Mathematics,"Integral Calculus","Integration by Parts",60,4,3,Beginner,false,Standard
Physics,"Quantum Mechanics","Wave-Particle Duality",75,5,5,Beginner,true,Intensive
Physics,"Classical Mechanics","Newton's Laws",30,3,2,Intermediate,false,Light
Chemistry,"Organic Chemistry","Reaction Mechanisms",50,4,4,Beginner,true,Intensive
Biology,"Cell Biology","Mitosis and Meiosis",25,3,2,Advanced,false,Light
Computer Science,"Data Structures","Binary Trees",40,4,3,Intermediate,false,Standard
English,"Literature","Shakespearean Analysis",35,3,3,Intermediate,false,Standard`
    };
    
    const blob = new Blob([templates[type]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'topics' ? 'comprehensive_topics_template.csv' : `${type}_template.csv`;
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
          {/* Upload Topics - Single comprehensive CSV */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Topics & Subjects
              </CardTitle>
              <CardDescription>
                Upload a comprehensive CSV file containing all topic and subject data. Subjects will be auto-extracted from the topic data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleFileUpload('topics')}
                  className="w-full"
                  size="lg"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Upload Comprehensive Topics CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('topics')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Enhanced Template
                </Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Required Fields:</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>subject:</strong> Subject name (auto-populates subject dropdown)</p>
                  <p><strong>topic_title:</strong> Main topic name</p>
                  <p><strong>sub_topic:</strong> Specific sub-topic or chapter</p>
                </div>
                <div className="text-sm font-medium mt-3">Optional Fields (with defaults):</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>estimated_minutes:</strong> Study time (default: 30)</p>
                  <p><strong>weightage:</strong> Exam importance 1-5 (default: 3)</p>
                  <p><strong>difficulty:</strong> Learning difficulty 1-5 (default: 3)</p>
                  <p><strong>mastery_level:</strong> Beginner/Intermediate/Advanced/Mastered (default: Beginner)</p>
                  <p><strong>must_win:</strong> true/false for critical topics (default: false)</p>
                  <p><strong>revision_frequency:</strong> Light/Standard/Intensive (auto-calculated from weightage+difficulty)</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        <TabsContent value="analytics" className="space-y-6">
          {/* System-wide KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Students"
              value={mockSystemAnalytics.totalStudents}
              icon={Users}
              delta={{ value: 8.5, isPositive: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            />
            <KpiCard
              title="Active Today"
              value={mockSystemAnalytics.activeStudents}
              icon={Activity}
              delta={{ value: 12.3, isPositive: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            />
            <KpiCard
              title="Daily Revisions"
              value={mockSystemAnalytics.dailyRevisions.toLocaleString()}
              icon={Target}
              delta={{ value: 15.7, isPositive: true }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
            />
            <KpiCard
              title="Completion Rate"
              value={`${mockSystemAnalytics.completionRate}%`}
              icon={CheckCircle}
              delta={{ value: -2.1, isPositive: false }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            />
          </div>

          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Student Performance Overview
                </CardTitle>
                <CardDescription>Key performance indicators across all students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">{mockLeaderboardInsights.topPerformers.length}</div>
                    <div className="text-sm text-muted-foreground">Top Performers</div>
                    <div className="text-xs text-emerald-600 mt-1">95%+ scores</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{mockLeaderboardInsights.struggling.length}</div>
                    <div className="text-sm text-muted-foreground">Need Support</div>
                    <div className="text-xs text-red-600 mt-1">&lt; 65% scores</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span className="font-semibold">{mockLeaderboardInsights.averageMetrics.score}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Weekly Minutes</span>
                    <span className="font-semibold">{mockLeaderboardInsights.averageMetrics.weeklyMinutes}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Streak</span>
                    <span className="font-semibold">{mockLeaderboardInsights.averageMetrics.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Performance
                </CardTitle>
                <CardDescription>Performance metrics across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSubjectPerformance.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{subject.subject}</div>
                        <div className="text-sm text-muted-foreground">{subject.students} students</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold">{subject.avgScore}%</div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{subject.completion}%</div>
                          <div className="text-xs text-muted-foreground">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">{subject.difficulty}/5</div>
                          <div className="text-xs text-muted-foreground">Difficulty</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Weekly Engagement
                </CardTitle>
                <CardDescription>Daily active users and session data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockEngagementData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="w-20">{day.day.slice(0, 3)}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="bg-primary/20 rounded h-2 flex-1 relative">
                          <div 
                            className="bg-primary rounded h-2" 
                            style={{ width: `${(day.active / 100) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium w-8">{day.active}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Study Time Analytics
                </CardTitle>
                <CardDescription>Time-based performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{mockSystemAnalytics.avgDailyStudyTime}h</div>
                    <div className="text-xs text-muted-foreground">Avg Daily Study</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{mockSystemAnalytics.avgSessionTime}m</div>
                    <div className="text-xs text-muted-foreground">Avg Session</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Platform Uptime</span>
                    <span className="font-semibold text-green-600">{mockSystemAnalytics.platformUptime}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Total</span>
                    <span className="font-semibold">{mockEngagementData.reduce((acc, day) => acc + day.minutes, 0).toLocaleString()}m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Leaderboard Insights
                </CardTitle>
                <CardDescription>Top performers and achievement data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Top 5 Performers</div>
                  {mockLeaderboardInsights.topPerformers.slice(0, 3).map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.topics} topics</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-yellow-600">{student.score}%</div>
                        <div className="text-xs text-muted-foreground">{student.streak} streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Students Needing Support
                </CardTitle>
                <CardDescription>Students with low performance requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLeaderboardInsights.struggling.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-red-600">{student.overdue} overdue topics</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{student.score}%</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Help
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Weekly performance trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPerformanceTrends.map((week, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{week.week}</span>
                        <div className="flex items-center gap-1">
                          {week.onTime > (mockPerformanceTrends[index - 1]?.onTime || 0) ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{week.onTime}%</div>
                          <div className="text-muted-foreground">On-time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{week.completion}%</div>
                          <div className="text-muted-foreground">Complete</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{week.engagement}%</div>
                          <div className="text-muted-foreground">Engaged</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Health & Performance
              </CardTitle>
              <CardDescription>Platform reliability and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{mockSystemAnalytics.platformUptime}%</div>
                  <div className="text-sm text-muted-foreground">Platform Uptime</div>
                  <div className="text-xs text-green-600 mt-1">Last 30 days</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{mockSystemAnalytics.totalTopics}</div>
                  <div className="text-sm text-muted-foreground">Total Topics</div>
                  <div className="text-xs text-blue-600 mt-1">Across {mockSystemAnalytics.totalSubjects} subjects</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{mockSystemAnalytics.weeklyRevisions.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Weekly Revisions</div>
                  <div className="text-xs text-purple-600 mt-1">+18% from last week</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{mockSystemAnalytics.onTimeRate}%</div>
                  <div className="text-sm text-muted-foreground">On-time Rate</div>
                  <div className="text-xs text-orange-600 mt-1">System average</div>
                </div>
              </div>
            </CardContent>
          </Card>
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