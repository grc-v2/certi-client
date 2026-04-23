export type PlanStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED" | string;

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface StudyPlanCertificationInfo {
  id: number;
  name: string;
  code: string;
  slug: string;
}

export interface StudyPlanProgressInfo {
  percent: string | null;
  completedHours: string | null;
  totalHours: string | null;
}

export interface StudyPlanScheduleInfo {
  startDate: string | null;
  examDate: string | null;
  daysToExam: number | null;
  dailyStudyMinutes: number | null;
  studyDaysPerWeek: number | null;
  currentWeek: number | null;
  totalWeeks: number | null;
  nextTaskDate: string | null;
}

export interface StudyPlanMilestonesInfo {
  achieved: number;
  total: number;
}

export interface StudyPlanTimestampsInfo {
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanListItem {
  id: number;
  status: PlanStatus;
  certification: StudyPlanCertificationInfo;
  progress: StudyPlanProgressInfo;
  schedule: StudyPlanScheduleInfo;
  milestones: StudyPlanMilestonesInfo;
  timestamps: StudyPlanTimestampsInfo;
}

export interface StudyPlanPageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface StudyPlanSummary {
  total: number;
  active: number;
  paused: number;
  completed: number;
  dueIn7Days: number;
  overdue: number;
}

export interface StudyPlanListResponse {
  items: StudyPlanListItem[];
  page: StudyPlanPageInfo;
  summary: StudyPlanSummary;
}

export interface DomainAllocation {
  id?: number;
  domainId?: number;
  domainName?: string;
  allocatedHours?: string | null;
  weightPercentage?: string | null;
  completedHours?: string | null;
  proficiencyLevel?: string | null;
}

export interface WeekTask {
  id?: number;
  title?: string;
  description?: string | null;
  scheduledDate?: string | null;
  status?: string;
  estimatedMinutes?: number | null;
  type?: string;
}

export interface StudyPlanWeek {
  id?: number;
  weekNumber: number;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  focusArea?: string | null;
  tasks?: WeekTask[];
}

export interface StudyPlanMilestone {
  id?: number;
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  achieved?: boolean;
  achievedAt?: string | null;
}

export interface StudyPlanDetail {
  id: number;
  certificationId: number;
  certificationName: string;
  status: PlanStatus;
  examDate: string;
  dailyStudyMinutes: number;
  studyDaysPerWeek: number;
  preferredStudyDays?: string[] | null;
  experienceLevel: string;
  totalStudyHours: string | null;
  completedHours: string | null;
  progress: string | null;
  readiness: string | null;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  createdAt: string;
  domainAllocations?: DomainAllocation[];
  weeks?: StudyPlanWeek[];
  milestones?: StudyPlanMilestone[];
}
