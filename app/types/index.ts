export interface Resource {
  id: string;
  name: string;
  instructor?: string;
  university?: string;
  platform?: string;
  type?: string;
  format?: string;
  url: string;
  isFree?: boolean;
  rating?: number;
  description?: string;
  tags?: string[];
  auditNote?: string;
  videoUrl?: string;
  topics?: string[];
  duration?: string;
}

export interface MathTopic {
  id: string;
  title: string;
  whyItMatters: string;
  mlConnections: string[];
  priority: number;
  phaseId: string;
  icon: string;
  color: string;
  subtopics: string[];
  resources: Resource[];
}

export interface PythonTopic {
  id: string;
  title: string;
  description: string;
  keySkills?: string[];
  resources: Resource[];
}

export interface ArchitectureGroup {
  id: string;
  groupTitle: string;
  description: string;
  icon: string;
  architectures: string[];
  resources: Resource[];
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  university: string;
  url: string;
  isFree: boolean;
  description: string;
  coverTopics?: string[];
  tags?: string[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  url: string;
  significance: string;
  mustRead?: boolean;
}

export interface ScheduleEntry {
  week: string;
  focus: string;
  daily: string;
  milestone: string;
}

export interface Phase {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  estimatedWeeks: string;
  color: string;
  icon: string;
  description: string;
}

// ── Practice & Projects ───────────────────────────────────────────────────────

export interface PracticePlatform {
  id: string;
  name: string;
  url: string;
  type: string;
  isFree: boolean;
  description: string;
  bestFor?: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  phase?: string;
  description?: string;
  deliverable?: string;
  difficulty?: string;
}

// ── Community & Blogs ─────────────────────────────────────────────────────────

export interface CommunityBlog {
  id: string;
  name: string;
  author?: string;
  url: string;
  description: string;
}

export interface YouTubeChannel {
  id: string;
  name: string;
  author?: string;
  url: string;
  description: string;
  focus?: string;
}

export interface AppData {
  meta: {
    title: string;
    subtitle: string;
    description: string;
    targetAudience: string;
    lastUpdated: string;
    totalResources: number;
  };
  roadmap: { phases: Phase[] };
  programmingFundamentals: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    topics: PythonTopic[];
  };
  mathematics: {
    sectionTitle: string;
    sectionSubtitle: string;
    importance: string;
    topics: MathTopic[];
  };
  pythonML: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    topics: PythonTopic[];
  };
  machineLearning: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    courses: Resource[];
  };
  deepLearning: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    courses: Resource[];
  };
  architectures: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    architectureGroups: ArchitectureGroup[];
  };
  researchMethodology: {
    sectionTitle: string;
    sectionSubtitle: string;
    phaseId: string;
    topics: PythonTopic[];
  };
  freeBooksAndPapers: {
    sectionTitle: string;
    sectionSubtitle: string;
    books: Book[];
    seminalPapers: Paper[];
  };
  weeklySchedule: {
    sectionTitle: string;
    totalMonths: string;
    schedule: ScheduleEntry[];
  };
  practiceAndProjects?: {
    sectionTitle: string;
    sectionSubtitle: string;
    platforms: PracticePlatform[];
    projectMilestones: ProjectMilestone[];
  };
  communityAndBlogs?: {
    sectionTitle: string;
    sectionSubtitle: string;
    blogs: CommunityBlog[];
    youtubeChannels: YouTubeChannel[];
  };
}

export type NavSection =
  | 'overview'
  | 'programming'
  | 'math'
  | 'python'
  | 'ml'
  | 'deeplearning'
  | 'architectures'
  | 'research'
  | 'books'
  | 'schedule'
  | 'mindmap';

// ── User / Auth ───────────────────────────────────────────────────────────────

export interface ScheduleDayEntry {
  id: string;         // e.g. "phase1-week1-day1"
  dayLabel: string;   // "Day 1"
  task: string;       // short task description
  detail?: string;    // extended detail
  completed: boolean;
  completedAt?: string; // ISO date string
  skipped?: boolean;
  lateBy?: number;    // days late
}

export interface ScheduleWeek {
  weekNumber: number;
  label: string;      // "Week 1"
  days: ScheduleDayEntry[];
}

export interface SchedulePhaseData {
  phaseId: string;    // "phase-1" etc.
  phaseNumber: number;
  title: string;
  weeks: ScheduleWeek[];
}

export interface UserScheduleState {
  selectedPhase: string;
  startDate: string | null; // ISO date string for selected phase start
  // track per-day completion states
  completedDays: Record<string, string>; // dayId -> completedAt ISO string
  skippedDays: Record<string, boolean>;
}

export interface UserProfile {
  userId: string;
  createdAt: string;
  lastSeen: string;
  // completed resource IDs
  completedResources: string[];
  // schedule state per phase
  schedule: UserScheduleState;
}
