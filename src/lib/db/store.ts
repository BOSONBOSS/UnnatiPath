"use client";

import { useState, useEffect } from "react";
import {
  Provider,
  Course,
  Trainee,
  Employer,
  TrainingRecord,
  EmploymentOutcome,
  VerificationRequest,
  FollowupTouchpoint,
  SkillGapSignal,
  AuditLog,
  StakeholderRole,
  VerificationStatus,
  OutcomeType
} from "../types";
import {
  INITIAL_PROVIDERS,
  INITIAL_COURSES,
  INITIAL_TRAINEES,
  INITIAL_EMPLOYERS,
  INITIAL_TRAINING_RECORDS,
  INITIAL_EMPLOYMENT_OUTCOMES,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_FOLLOWUPS,
  INITIAL_SKILL_GAP_SIGNALS,
  INITIAL_AUDIT_LOGS
} from "./mock-data";

const STORAGE_KEY = "unnatipath_store_v1";

export interface DatabaseState {
  providers: Provider[];
  courses: Course[];
  trainees: Trainee[];
  employers: Employer[];
  trainingRecords: TrainingRecord[];
  employmentOutcomes: EmploymentOutcome[];
  verificationRequests: VerificationRequest[];
  followupTouchpoints: FollowupTouchpoint[];
  skillGapSignals: SkillGapSignal[];
  auditLogs: AuditLog[];
  currentRole: StakeholderRole;
  activeTraineeId: string;
}

function getInitialState(): DatabaseState {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading localStorage, using defaults", e);
    }
  }

  return {
    providers: INITIAL_PROVIDERS,
    courses: INITIAL_COURSES,
    trainees: INITIAL_TRAINEES,
    employers: INITIAL_EMPLOYERS,
    trainingRecords: INITIAL_TRAINING_RECORDS,
    employmentOutcomes: INITIAL_EMPLOYMENT_OUTCOMES,
    verificationRequests: INITIAL_VERIFICATION_REQUESTS,
    followupTouchpoints: INITIAL_FOLLOWUPS,
    skillGapSignals: INITIAL_SKILL_GAP_SIGNALS,
    auditLogs: INITIAL_AUDIT_LOGS,
    currentRole: "TRAINEE",
    activeTraineeId: "trainee-1" // Rahul Kumar
  };
}

let globalState: DatabaseState = getInitialState();
const listeners = new Set<(state: DatabaseState) => void>();

function notifyListeners() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      console.error("Error writing to localStorage", e);
    }
  }
  listeners.forEach((listener) => listener(globalState));
}

export function useAppStore() {
  const [state, setState] = useState<DatabaseState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  // --- ACTIONS ---

  const setCurrentRole = (role: StakeholderRole) => {
    globalState = { ...globalState, currentRole: role };
    notifyListeners();
  };

  const verifyTrainingClaim = (requestId: string, reviewerNotes?: string) => {
    const request = globalState.verificationRequests.find((r) => r.id === requestId);
    if (!request) return;

    const now = new Date().toISOString();

    // 1. Update verification request
    const updatedRequests = globalState.verificationRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "VERIFIED" as VerificationStatus,
            notes: reviewerNotes || "Verified by Training Institution Dean of Assessments",
            updatedAt: now
          }
        : r
    );

    // 2. Update training record
    const updatedRecords = globalState.trainingRecords.map((tr) =>
      tr.traineeId === request.traineeId
        ? {
            ...tr,
            verificationStatus: "VERIFIED" as VerificationStatus,
            verifiedAt: now,
            verifiedBy: "Dean of Assessments, MASI"
          }
        : tr
    );

    // 3. Create Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: "inst-user-1",
      actorName: "MASI Verification Officer",
      actorRole: "TRAINING_INSTITUTION",
      action: "TRAINING_CLAIM_VERIFIED",
      tableName: "training_records",
      recordId: request.id,
      metadata: { traineeId: request.traineeId, course: request.courseName, status: "VERIFIED" },
      createdAt: now
    };

    globalState = {
      ...globalState,
      verificationRequests: updatedRequests,
      trainingRecords: updatedRecords,
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const rejectTrainingClaim = (requestId: string, reason: string) => {
    const request = globalState.verificationRequests.find((r) => r.id === requestId);
    if (!request) return;

    const now = new Date().toISOString();

    const updatedRequests = globalState.verificationRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: "REJECTED" as VerificationStatus, notes: reason, updatedAt: now }
        : r
    );

    const updatedRecords = globalState.trainingRecords.map((tr) =>
      tr.traineeId === request.traineeId
        ? { ...tr, verificationStatus: "REJECTED" as VerificationStatus }
        : tr
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: "inst-user-1",
      actorName: "MASI Verification Officer",
      actorRole: "TRAINING_INSTITUTION",
      action: "TRAINING_CLAIM_REJECTED",
      tableName: "training_records",
      recordId: request.id,
      metadata: { traineeId: request.traineeId, reason },
      createdAt: now
    };

    globalState = {
      ...globalState,
      verificationRequests: updatedRequests,
      trainingRecords: updatedRecords,
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const verifyEmploymentClaim = (requestId: string, reviewerNotes?: string) => {
    const request = globalState.verificationRequests.find((r) => r.id === requestId);
    if (!request) return;

    const now = new Date().toISOString();

    // 1. Update verification request
    const updatedRequests = globalState.verificationRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "VERIFIED" as VerificationStatus,
            notes: reviewerNotes || "Confirmed active employment on payroll by HR Ops",
            updatedAt: now
          }
        : r
    );

    // 2. Update employment outcome
    const updatedOutcomes = globalState.employmentOutcomes.map((eo) =>
      eo.traineeId === request.traineeId
        ? {
            ...eo,
            verificationStatus: "VERIFIED" as VerificationStatus,
            employerVerified: true,
            verifiedAt: now
          }
        : eo
    );

    // 3. Create Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: "emp-user-1",
      actorName: "HR Operations Lead, XYZ Precision",
      actorRole: "EMPLOYER",
      action: "EMPLOYMENT_CLAIM_VERIFIED",
      tableName: "employment_outcomes",
      recordId: request.id,
      metadata: {
        traineeId: request.traineeId,
        role: request.jobRole,
        employer: request.targetName,
        status: "VERIFIED"
      },
      createdAt: now
    };

    globalState = {
      ...globalState,
      verificationRequests: updatedRequests,
      employmentOutcomes: updatedOutcomes,
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const rejectEmploymentClaim = (requestId: string, reason: string) => {
    const request = globalState.verificationRequests.find((r) => r.id === requestId);
    if (!request) return;

    const now = new Date().toISOString();

    const updatedRequests = globalState.verificationRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: "REJECTED" as VerificationStatus, notes: reason, updatedAt: now }
        : r
    );

    const updatedOutcomes = globalState.employmentOutcomes.map((eo) =>
      eo.traineeId === request.traineeId
        ? {
            ...eo,
            verificationStatus: "REJECTED" as VerificationStatus,
            employerVerified: false
          }
        : eo
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: "emp-user-1",
      actorName: "HR Operations Lead, XYZ Precision",
      actorRole: "EMPLOYER",
      action: "EMPLOYMENT_CLAIM_REJECTED",
      tableName: "employment_outcomes",
      recordId: request.id,
      metadata: { traineeId: request.traineeId, reason },
      createdAt: now
    };

    globalState = {
      ...globalState,
      verificationRequests: updatedRequests,
      employmentOutcomes: updatedOutcomes,
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const addTrainingClaim = (
    traineeId: string,
    data: {
      providerId: string;
      courseId: string;
      enrollmentDate: string;
      completionDate: string;
      certificateId: string;
    }
  ) => {
    const provider = globalState.providers.find((p) => p.id === data.providerId);
    const course = globalState.courses.find((c) => c.id === data.courseId);
    const trainee = globalState.trainees.find((t) => t.id === traineeId);
    const now = new Date().toISOString();

    const newRecordId = `tr-${Date.now()}`;
    const newRecord: TrainingRecord = {
      id: newRecordId,
      traineeId,
      courseId: data.courseId,
      courseName: course?.name || "Skill Training Course",
      providerId: data.providerId,
      providerName: provider?.name || "Training Provider",
      enrollmentDate: data.enrollmentDate,
      completionDate: data.completionDate,
      attendancePct: 94.0,
      assessmentScore: 88.0,
      certificateId: data.certificateId,
      certificationDate: data.completionDate,
      verificationStatus: "PENDING"
    };

    const newRequestId = `vr-${Date.now()}`;
    const newRequest: VerificationRequest = {
      id: newRequestId,
      claimType: "TRAINING_VERIFICATION",
      traineeId,
      traineeName: trainee?.name || "Rahul Kumar",
      targetId: data.providerId,
      targetName: provider?.name || "Training Provider",
      courseName: course?.name || "Skill Training Course",
      submittedAt: now,
      status: "PENDING",
      notes: "Trainee self-submitted credential. Verification requested.",
      updatedAt: now,
      certificateId: data.certificateId,
      assessmentScore: 88.0
    };

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: traineeId,
      actorName: trainee?.name || "Rahul Kumar",
      actorRole: "TRAINEE",
      action: "TRAINING_CLAIM_SUBMITTED",
      tableName: "training_records",
      recordId: newRecordId,
      metadata: { course: course?.name, provider: provider?.name },
      createdAt: now
    };

    globalState = {
      ...globalState,
      trainingRecords: [newRecord, ...globalState.trainingRecords],
      verificationRequests: [newRequest, ...globalState.verificationRequests],
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const addEmploymentClaim = (
    traineeId: string,
    data: {
      employerId: string;
      jobRole: string;
      sector: string;
      startDate: string;
      salaryBand: string;
    }
  ) => {
    const employer = globalState.employers.find((e) => e.id === data.employerId);
    const trainee = globalState.trainees.find((t) => t.id === traineeId);
    const now = new Date().toISOString();

    const newOutcomeId = `emp-out-${Date.now()}`;
    const newOutcome: EmploymentOutcome = {
      id: newOutcomeId,
      traineeId,
      traineeName: trainee?.name || "Rahul Kumar",
      employerId: data.employerId,
      employerName: employer?.name || "Employer",
      outcomeType: "EMPLOYED",
      jobRole: data.jobRole,
      salaryBand: data.salaryBand,
      sector: data.sector,
      startDate: data.startDate,
      retained6m: false,
      retained12m: false,
      verificationStatus: "PENDING",
      institutionVerified: true,
      employerVerified: false,
      epfoSignalVerified: true
    };

    const newRequestId = `vr-${Date.now()}`;
    const newRequest: VerificationRequest = {
      id: newRequestId,
      claimType: "EMPLOYMENT_VERIFICATION",
      traineeId,
      traineeName: trainee?.name || "Rahul Kumar",
      targetId: data.employerId,
      targetName: employer?.name || "Employer",
      jobRole: data.jobRole,
      submittedAt: now,
      status: "PENDING",
      notes: "Trainee self-submitted employment placement. Employer confirmation requested.",
      updatedAt: now,
      startDate: data.startDate
    };

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: traineeId,
      actorName: trainee?.name || "Rahul Kumar",
      actorRole: "TRAINEE",
      action: "EMPLOYMENT_CLAIM_SUBMITTED",
      tableName: "employment_outcomes",
      recordId: newOutcomeId,
      metadata: { employer: employer?.name, role: data.jobRole },
      createdAt: now
    };

    globalState = {
      ...globalState,
      employmentOutcomes: [newOutcome, ...globalState.employmentOutcomes],
      verificationRequests: [newRequest, ...globalState.verificationRequests],
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const submitFollowupResponse = (
    touchpointId: string,
    responseData: {
      employmentStatus: OutcomeType;
      jobRole?: string;
      employerName?: string;
      salaryBand?: string;
      nonPlacementReason?: string;
      feedback?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const touchpoint = globalState.followupTouchpoints.find((f) => f.id === touchpointId);
    const trainee = globalState.trainees.find((t) => t.id === touchpoint?.traineeId);

    // 1. Update Touchpoint
    const updatedTouchpoints = globalState.followupTouchpoints.map((f) =>
      f.id === touchpointId
        ? {
            ...f,
            status: "RESPONDED" as const,
            responseData,
            respondedAt: now
          }
        : f
    );

    // 2. Update Trainee Status & Employment Outcome
    const updatedTrainees = globalState.trainees.map((t) =>
      t.id === touchpoint?.traineeId
        ? {
            ...t,
            currentStatus: responseData.employmentStatus,
            currentRole: responseData.jobRole,
            currentEmployer: responseData.employerName
          }
        : t
    );

    const updatedOutcomes = globalState.employmentOutcomes.map((eo) =>
      eo.traineeId === touchpoint?.traineeId
        ? {
            ...eo,
            outcomeType: responseData.employmentStatus,
            jobRole: responseData.jobRole || eo.jobRole,
            employerName: responseData.employerName || eo.employerName,
            salaryBand: responseData.salaryBand || eo.salaryBand,
            nonPlacementReason: responseData.nonPlacementReason,
            nlpTags: responseData.nonPlacementReason?.toLowerCase().includes("cad")
              ? ["CAD", "AutoCAD", "Skill Mismatch", "CNC Operator"]
              : eo.nlpTags
          }
        : eo
    );

    // 3. Dynamic Skill Gap Signal Update for District (Pune)
    const updatedSignals = globalState.skillGapSignals.map((sgs) => {
      if (sgs.district === "Pune" && responseData.nonPlacementReason?.toLowerCase().includes("cad")) {
        return {
          ...sgs,
          employerDemandScore: Math.min(98, sgs.employerDemandScore + 2.5),
          nonPlacementReasons: [
            { reason: "Skill mismatch - CAD software proficiency demanded by auto-ancillaries", percentage: 54 },
            { reason: "Wages offered below ₹15,000 / month", percentage: 22 },
            { reason: "Commute distance over 35 km from industrial MIDC zones", percentage: 15 },
            { reason: "Other personal/relocation reasons", percentage: 9 }
          ],
          computedAt: now
        };
      }
      return sgs;
    });

    // 4. Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: trainee?.id || "trainee-1",
      actorName: trainee?.name || "Rahul Kumar",
      actorRole: "TRAINEE",
      action: "LONGITUDINAL_FOLLOWUP_SUBMITTED",
      tableName: "followup_touchpoints",
      recordId: touchpointId,
      metadata: {
        checkpointDays: touchpoint?.checkpointDays,
        status: responseData.employmentStatus,
        reason: responseData.nonPlacementReason
      },
      createdAt: now
    };

    globalState = {
      ...globalState,
      followupTouchpoints: updatedTouchpoints,
      trainees: updatedTrainees,
      employmentOutcomes: updatedOutcomes,
      skillGapSignals: updatedSignals,
      auditLogs: [newLog, ...globalState.auditLogs]
    };

    notifyListeners();
  };

  const resetToDefaults = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    globalState = {
      providers: INITIAL_PROVIDERS,
      courses: INITIAL_COURSES,
      trainees: INITIAL_TRAINEES,
      employers: INITIAL_EMPLOYERS,
      trainingRecords: INITIAL_TRAINING_RECORDS,
      employmentOutcomes: INITIAL_EMPLOYMENT_OUTCOMES,
      verificationRequests: INITIAL_VERIFICATION_REQUESTS,
      followupTouchpoints: INITIAL_FOLLOWUPS,
      skillGapSignals: INITIAL_SKILL_GAP_SIGNALS,
      auditLogs: INITIAL_AUDIT_LOGS,
      currentRole: "TRAINEE",
      activeTraineeId: "trainee-1"
    };
    notifyListeners();
  };

  return {
    state,
    setCurrentRole,
    verifyTrainingClaim,
    rejectTrainingClaim,
    verifyEmploymentClaim,
    rejectEmploymentClaim,
    addTrainingClaim,
    addEmploymentClaim,
    submitFollowupResponse,
    resetToDefaults
  };
}
