// Mock API for Revision Planner - Demo data and CRUD operations

import { 
  Topic, 
  RevisionSchedule, 
  RevisionSession, 
  DashboardData, 
  TopicCardData, 
  KPIData, 
  LeaderboardEntry, 
  ComparisonData, 
  AnalyticsData,
  UserSettings 
} from '@/types/revision';

// Demo Topics
const mockTopics: Topic[] = [
  {
    id: '1',
    subject: 'Mathematics',
    title: 'Differential Calculus',
    subTopic: 'Chain Rule',
    firstStudied: new Date('2024-08-15'),
    estimatedMinutes: 45,
    weightage: 5,
    difficulty: 4,
    masteryLevel: 'Intermediate',
    mustWin: true,
    isArchived: false,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15'),
  },
  {
    id: '2',
    subject: 'Physics',
    title: 'Quantum Mechanics',
    subTopic: 'Wave-Particle Duality',
    firstStudied: new Date('2024-08-20'),
    estimatedMinutes: 60,
    weightage: 5,
    difficulty: 5,
    masteryLevel: 'Beginner',
    mustWin: true,
    isArchived: false,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: '3',
    subject: 'Chemistry',
    title: 'Organic Reactions',
    subTopic: 'Addition Reactions',
    firstStudied: new Date('2024-08-18'),
    estimatedMinutes: 30,
    weightage: 4,
    difficulty: 3,
    masteryLevel: 'Advanced',
    mustWin: false,
    isArchived: false,
    createdAt: new Date('2024-08-18'),
    updatedAt: new Date('2024-08-18'),
  },
  {
    id: '4',
    subject: 'Biology',
    title: 'Cell Division',
    subTopic: 'Mitosis Phases',
    firstStudied: new Date('2024-08-25'),
    estimatedMinutes: 25,
    weightage: 3,
    difficulty: 2,
    masteryLevel: 'Intermediate',
    mustWin: false,
    isArchived: false,
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-08-25'),
  },
];

// Demo schedules
const mockSchedules: RevisionSchedule[] = [
  {
    id: 's1',
    topicId: '1',
    cycle: 7,
    dueDate: new Date(), // Due today
    isCompleted: false,
    completedAt: null,
    isSnoozed: false,
    snoozeDate: null,
    snoozeDays: 0,
    cascadeSnoozed: false,
    createdAt: new Date('2024-08-22'),
  },
  {
    id: 's2',
    topicId: '2',
    cycle: 14,
    dueDate: new Date(Date.now() - 86400000), // Overdue by 1 day
    isCompleted: false,
    completedAt: null,
    isSnoozed: false,
    snoozeDate: null,
    snoozeDays: 0,
    cascadeSnoozed: false,
    createdAt: new Date('2024-08-20'),
  },
  {
    id: 's3',
    topicId: '3',
    cycle: 21,
    dueDate: new Date(Date.now() + 86400000 * 3), // Snoozed, starts in 3 days
    isCompleted: false,
    completedAt: null,
    isSnoozed: true,
    snoozeDate: new Date(Date.now() + 86400000 * 3),
    snoozeDays: 3,
    cascadeSnoozed: true,
    createdAt: new Date('2024-08-18'),
  },
];

// Demo KPI data
const mockKPIs: KPIData = {
  dueToday: 2,
  overdue: 1,
  completedToday: 3,
  weeklyMinutes: 280,
  onTimeRate: 87,
  avgLateness: 1.2,
  currentStreak: 5,
  bestStreak: 12,
  mostRevisedTopic: 'Differential Calculus',
  mostTimeSpentTopic: 'Quantum Mechanics',
  snoozeCount: 2,
  weeklyMinutesSparkline: [45, 60, 30, 75, 90, 45, 35],
};

// Mock API functions
export const mockApi = {
  // Dashboard
  async getDashboardData(): Promise<DashboardData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dueToday: TopicCardData[] = [
      {
        id: '1',
        subject: 'Mathematics',
        title: 'Differential Calculus',
        cycle: 7,
        dueStatus: 'Due Today',
        estimatedMinutes: 45,
        progress: [true, true, false, false],
        nextDates: [
          new Date(Date.now() + 86400000 * 7),
          new Date(Date.now() + 86400000 * 14),
          new Date(Date.now() + 86400000 * 21),
        ],
        scheduleId: 's1',
      },
      {
        id: '2',
        subject: 'Physics',
        title: 'Quantum Mechanics',
        cycle: 14,
        dueStatus: 'Overdue',
        estimatedMinutes: 60,
        progress: [true, false, false, false],
        nextDates: [
          new Date(Date.now() + 86400000 * 14),
          new Date(Date.now() + 86400000 * 21),
          new Date(Date.now() + 86400000 * 28),
        ],
        scheduleId: 's2',
        daysOverdue: 1,
      },
    ];

    const upcomingDays = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + 86400000 * (i + 1)),
      totalMinutes: Math.floor(Math.random() * 120) + 30,
      topicCount: Math.floor(Math.random() * 5) + 1,
    }));

    return {
      date: new Date(),
      dueToday,
      overdueCount: 1,
      completedToday: 3,
      weeklyMinutes: 280,
      onTimeRate: 87,
      currentStreak: 5,
      bestStreak: 12,
      upcomingDays,
    };
  },

  // Topics and Schedules
  async getTopics(): Promise<Topic[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockTopics];
  },

  async createTopic(topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Topic> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTopic: Topic = {
      ...topic,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTopics.push(newTopic);
    return newTopic;
  },

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockTopics.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Topic not found');
    
    mockTopics[index] = { ...mockTopics[index], ...updates, updatedAt: new Date() };
    return mockTopics[index];
  },

  async deleteTopic(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockTopics.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Topic not found');
    mockTopics.splice(index, 1);
  },

  // Snooze operations
  async snoozeTopic(scheduleId: string, days: number, cascade: boolean): Promise<{ newDates: Date[] }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const schedule = mockSchedules.find(s => s.id === scheduleId);
    if (!schedule) throw new Error('Schedule not found');
    
    schedule.isSnoozed = true;
    schedule.snoozeDays = days;
    schedule.snoozeDate = new Date(Date.now() + days * 86400000);
    schedule.cascadeSnoozed = cascade;
    
    const newDates = [
      new Date(schedule.snoozeDate.getTime() + 7 * 86400000),
      new Date(schedule.snoozeDate.getTime() + 14 * 86400000),
      new Date(schedule.snoozeDate.getTime() + 21 * 86400000),
    ];
    
    return { newDates };
  },

  // Timer operations
  async startTimer(topicId: string, plannedSeconds: number): Promise<{ sessionId: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { sessionId: `session_${Date.now()}` };
  },

  async finishTimer(sessionId: string, actualSeconds: number, rating: string, notes?: string): Promise<{ 
    nextDueDate: Date; 
    cycleAdvanced: boolean; 
    scheduleId: string 
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      nextDueDate: new Date(Date.now() + 7 * 86400000),
      cycleAdvanced: true,
      scheduleId: 's1',
    };
  },

  // Analytics
  async getAnalytics(range: string): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      kpis: mockKPIs,
      backlogBurndown: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000),
        count: Math.max(0, 15 - i + Math.floor(Math.random() * 5)),
      })),
      loadForecast: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() + i * 86400000),
        minutes: Math.floor(Math.random() * 120) + 30,
      })),
      masteryDistribution: [
        { level: 'Beginner', count: 5 },
        { level: 'Intermediate', count: 8 },
        { level: 'Advanced', count: 3 },
        { level: 'Mastered', count: 1 },
      ],
      snoozeHeatmap: [
        { day: 'Mon', count: 2 },
        { day: 'Tue', count: 1 },
        { day: 'Wed', count: 4 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 3 },
        { day: 'Sat', count: 2 },
        { day: 'Sun', count: 1 },
      ],
      mostRevisedTopics: [
        { topic: 'Differential Calculus', count: 12 },
        { topic: 'Quantum Mechanics', count: 8 },
        { topic: 'Organic Reactions', count: 6 },
        { topic: 'Cell Division', count: 4 },
        { topic: 'Thermodynamics', count: 3 },
      ],
      mostTimeSpentTopics: [
        { topic: 'Quantum Mechanics', minutes: 420 },
        { topic: 'Differential Calculus', minutes: 380 },
        { topic: 'Organic Reactions', minutes: 240 },
        { topic: 'Cell Division', minutes: 180 },
        { topic: 'Thermodynamics', minutes: 150 },
      ],
    };
  },

  // Leaderboards
  async getLeaderboard(scope: string, window: string): Promise<LeaderboardEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      { id: '1', name: 'Alex Chen', rank: 1, onTimeRate: 95, weeklyMinutes: 420, avgTimePerRevision: 38, consistency: 92, coverage: 88 },
      { id: '2', name: 'You', rank: 2, onTimeRate: 87, weeklyMinutes: 280, avgTimePerRevision: 35, consistency: 85, coverage: 78, isCurrentUser: true },
      { id: '3', name: 'Sarah Kim', rank: 3, onTimeRate: 84, weeklyMinutes: 315, avgTimePerRevision: 42, consistency: 88, coverage: 82 },
      { id: '4', name: 'Mike Johnson', rank: 4, onTimeRate: 82, weeklyMinutes: 290, avgTimePerRevision: 36, consistency: 80, coverage: 75 },
      { id: '5', name: 'Emma Davis', rank: 5, onTimeRate: 79, weeklyMinutes: 265, avgTimePerRevision: 33, consistency: 83, coverage: 72 },
    ];
  },

  async getComparison(scope: string, id: string, window: string): Promise<ComparisonData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      you: { id: 'you', name: 'You', rank: 2, onTimeRate: 87, weeklyMinutes: 280, avgTimePerRevision: 35, consistency: 85, coverage: 78 },
      topper: { id: 'top', name: 'Top 5%', rank: 1, onTimeRate: 95, weeklyMinutes: 420, avgTimePerRevision: 38, consistency: 92, coverage: 88 },
      average: { id: 'avg', name: 'Average', rank: 50, onTimeRate: 72, weeklyMinutes: 225, avgTimePerRevision: 40, consistency: 65, coverage: 60 },
      struggling: { id: 'low', name: 'Bottom 20%', rank: 80, onTimeRate: 58, weeklyMinutes: 150, avgTimePerRevision: 45, consistency: 45, coverage: 40 },
    };
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      dailyCapacityMinutes: 45,
      pushWindowStart: '09:00',
      pushWindowEnd: '21:00',
      enableCascadeSnoozByDefault: true,
      timerQuickPresets: [15, 30, 45, 60],
      anonymizeOnLeaderboards: false,
      timezone: 'Asia/Kolkata',
    };
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In real app, would persist to backend
    return { ...(await this.getSettings()), ...settings };
  },
};