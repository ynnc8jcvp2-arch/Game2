export interface QuickAddTemplate {
  label: string;
  type: Assessment['type'];
  weight: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  targetAverage?: number;
  onboardingComplete?: boolean;
  top6Projection?: number;
  universityGoals?: string[];
  defaultAssessmentType?: Assessment['type'];
  defaultAssessmentWeight?: number;
  quickAddTemplates?: QuickAddTemplate[];
  isPremium?: boolean;
}

export interface Course {
  id: string;
  uid: string;
  name: string;
  code?: string;
  creditWeight?: number;
  targetMark?: number;
  currentAverage?: number;
  color?: string;
  createdAt?: any;
}

export interface Assessment {
  id: string;
  uid: string;
  courseId: string;
  title: string;
  type: 'Test' | 'Assignment' | 'Quiz' | 'Exam' | 'Other';
  score: number;
  total: number;
  weight: number;
  date?: any;
  kcat?: { k: number, c: number, a: number, t: number } | null;
}

export interface Friendship {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted';
  createdAt?: any;
}

export interface FeedEvent {
  id: string;
  uid: string;
  userName: string;
  type: 'grade_improvement' | 'course_added' | 'goal_reached';
  content: string;
  createdAt: any;
}

export interface Reaction {
  id: string;
  eventId: string;
  uid: string;
  type: 'kudos' | 'keep_it_up';
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
  }
}
