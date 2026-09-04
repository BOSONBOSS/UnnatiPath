export type StakeholderRole = 
  | "GOVERNMENT_OFFICER"
  | "TRAINING_INSTITUTION"
  | "TRAINEE"
  | "EMPLOYER";

export type VerificationStatus = 
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "DISPUTED"
  | "NEEDS_REVIEW";

export type OutcomeType = 
  | "EMPLOYED"
  | "SELF_EMPLOYED"
  | "APPRENTICESHIP"
  | "UNEMPLOYED"
  | "SEARCHING";

export interface Provider {
  id: string;
  name: string;
  district: string;
  contactEmail: string;
  placementRate: number; // 0 to 100
  verifiedPlacementRate: number; // 0 to 100
  retentionRate6m: number; // 0 to 100
  retentionRate12m: number; // 0 to 100
  totalTrainees: number;
  logoUrl?: string;
  verified: boolean;
  performanceScore: number; // calculated composite score
}

export interface Course {
  id: string;
  providerId: string;
  providerName?: string;
  name: string;
  sector: string;
  durationDays: number;
  qpCode: string;
  description: string;
  placementRate?: number;
  demandScore?: number;
}

export interface Trainee {
  id: string;
  skillId: string;
  pseudonymousId: string; // HMAC/SHA256 derived e.g. DL-9842-88
  name: string;
  phoneMasked: string; // e.g. +91 98****3210
  district: string;
  gender: "Male" | "Female" | "Other";
  casteCategory: "General" | "OBC" | "SC" | "ST" | "EWS";
  consentGiven: boolean;
  consentAt: string;
  createdAt: string;
  currentStatus: OutcomeType;
  currentRole?: string;
  currentEmployer?: string;
}

export interface Employer {
  id: string;
  name: string;
  pfRegistrationNo: string; // e.g. MH/PUN/0084729/000
  district: string;
  sector: string;
  verified: boolean;
  activeTraineesCount: number;
}

export interface TrainingRecord {
  id: string;
  traineeId: string;
  courseId: string;
  courseName: string;
  providerId: string;
  providerName: string;
  enrollmentDate: string;
  completionDate: string;
  attendancePct: number;
  assessmentScore: number;
  certificateId: string;
  certificationDate: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface EmploymentOutcome {
  id: string;
  traineeId: string;
  traineeName: string;
  employerId?: string;
  employerName?: string;
  outcomeType: OutcomeType;
  jobRole?: string;
  salaryBand?: string; // e.g. "Rs 18,000 - Rs 22,000/mo"
  sector: string;
  startDate?: string;
  retained6m: boolean;
  retained12m: boolean;
  verificationStatus: VerificationStatus;
  institutionVerified: boolean;
  employerVerified: boolean;
  epfoSignalVerified: boolean;
  nonPlacementReason?: string;
  nlpTags?: string[];
  verifiedAt?: string;
}

export interface VerificationRequest {
  id: string;
  claimType: "TRAINING_VERIFICATION" | "EMPLOYMENT_VERIFICATION";
  traineeId: string;
  traineeName: string;
  targetId: string; // Provider ID or Employer ID
  targetName: string;
  courseName?: string;
  jobRole?: string;
  submittedAt: string;
  status: VerificationStatus;
  notes?: string;
  updatedAt: string;
  certificateId?: string;
  assessmentScore?: number;
  startDate?: string;
}

export interface FollowupTouchpoint {
  id: string;
  traineeId: string;
  checkpointDays: 30 | 90 | 180 | 365;
  channel: "WHATSAPP" | "SMS" | "PORTAL";
  status: "PENDING" | "SENT" | "RESPONDED";
  responseData?: {
    employmentStatus: OutcomeType;
    jobRole?: string;
    employerName?: string;
    salaryBand?: string;
    nonPlacementReason?: string;
    feedback?: string;
  };
  sentAt?: string;
  respondedAt?: string;
}

export interface SkillGapSignal {
  id: string;
  district: string;
  courseName: string;
  sector: string;
  placementRate: number;
  avgDaysToPlacement: number;
  employerDemandScore: number; // 0 to 100
  topMissingSkills: string[];
  nonPlacementReasons: { reason: string; percentage: number }[];
  computedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: StakeholderRole | "SYSTEM";
  action: string;
  tableName: string;
  recordId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  user: {
    name: string;
    pseudonymousId: string;
    role: StakeholderRole;
    district?: string;
    institutionId?: string;
    employerId?: string;
  } | null;
}
