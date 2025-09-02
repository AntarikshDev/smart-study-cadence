// Data types for Revision Planner

export interface Topic {
  id: string;
  subject: string;
  title: string;
  firstStudied: Date | null;
  estimatedMinutes: number;
  weightage: number; // 1-5
  difficulty: number; // 1-5
  masteryLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastered';
  mustWin: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevisionSchedule {
  id: string;
  topicId: string;
  cycle: 7 | 14 | 21 | 28;
  dueDate: Date;
  isCompleted: boolean;
  completedAt: Date | null;
  isSnoozed: boolean;
  snoozeDate: Date | null;
  snoozeDays: number;
  cascadeSnoozed: boolean;
  createdAt: Date;
}

export interface RevisionSession {
  id: string;
  topicId: string;
  scheduleId: string;
  startTime: Date;
  endTime: Date | null;
  plannedSeconds: number;
  actualSeconds: number;
  rating: 'Again' | 'Hard' | 'Good' | 'Easy' | null;
  notes: string;
  isPaused: boolean;
  pausedAt: Date | null;
  isCompleted: boolean;
}

export interface DashboardData {
  date: Date;
  dueToday: TopicCardData[];
  overdueCount: number;
  completedToday: number;
  weeklyMinutes: number;
  onTimeRate: number;
  currentStreak: number;
  bestStreak: number;
  upcomingDays: UpcomingDay[];
}

export interface TopicCardData {
  id: string;
  subject: string;
  title: string;
  cycle: 7 | 14 | 21 | 28;
  dueStatus: 'Due Today' | 'Overdue' | 'Snoozed';
  estimatedMinutes: number;
  progress: boolean[]; // History of completion for each cycle
  nextDates: Date[];
  scheduleId: string;
  daysOverdue?: number;
  snoozeInfo?: {
    days: number;
    startsIn: string;
    cascading: boolean;
  };
}

export interface UpcomingDay {
  date: Date;
  totalMinutes: number;
  topicCount: number;
}

export interface KPIData {
  dueToday: number;
  overdue: number;
  completedToday: number;
  weeklyMinutes: number;
  onTimeRate: number;
  avgLateness: number;
  currentStreak: number;
  bestStreak: number;
  mostRevisedTopic: string;
  mostTimeSpentTopic: string;
  snoozeCount: number;
  weeklyMinutesSparkline: number[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  rank: number;
  onTimeRate: number;
  weeklyMinutes: number;
  avgTimePerRevision: number;
  consistency: number;
  coverage: number;
  isCurrentUser?: boolean;
}

export interface ComparisonData {
  you: LeaderboardEntry;
  topper: LeaderboardEntry;
  average: LeaderboardEntry;
  struggling: LeaderboardEntry;
}

export interface AnalyticsData {
  kpis: KPIData;
  backlogBurndown: Array<{ date: Date; count: number }>;
  loadForecast: Array<{ date: Date; minutes: number }>;
  masteryDistribution: Array<{ level: string; count: number }>;
  snoozeHeatmap: Array<{ day: string; count: number }>;
  mostRevisedTopics: Array<{ topic: string; count: number }>;
  mostTimeSpentTopics: Array<{ topic: string; minutes: number }>;
}

export interface UserSettings {
  dailyCapacityMinutes: number;
  pushWindowStart: string; // HH:MM format
  pushWindowEnd: string; // HH:MM format
  enableCascadeSnoozByDefault: boolean;
  timerQuickPresets: number[]; // minutes
  anonymizeOnLeaderboards: boolean;
  timezone: string;
}