import { DatabaseState } from "../db/store";
import { Provider } from "../types";

export interface GovernmentKpis {
  totalTrainees: number;
  totalProviders: number;
  totalCourses: number;
  certifiedTrainees: number;
  reportedPlacements: number;
  verifiedEmployment: number;
  reportedEmploymentRate: number;
  verifiedEmploymentRate: number;
  retentionRate6m: number;
  retentionRate12m: number;
  averageSalaryBand: string;
  selfEmployedCount: number;
  apprenticeshipCount: number;
  pendingVerifications: number;
}

export function calculateGovernmentKpis(state: DatabaseState): GovernmentKpis {
  const totalTrainees = state.trainees.length;
  const totalProviders = state.providers.length;
  const totalCourses = state.courses.length;

  const certifiedTrainees = state.trainingRecords.filter(
    (tr) => tr.verificationStatus === "VERIFIED" || tr.certificateId
  ).length;

  const reportedPlacements = state.employmentOutcomes.filter(
    (eo) => eo.outcomeType === "EMPLOYED" || eo.outcomeType === "APPRENTICESHIP"
  ).length;

  const verifiedEmployment = state.employmentOutcomes.filter(
    (eo) =>
      eo.verificationStatus === "VERIFIED" &&
      (eo.outcomeType === "EMPLOYED" || eo.outcomeType === "APPRENTICESHIP")
  ).length;

  const reportedEmploymentRate =
    certifiedTrainees > 0 ? Math.round((reportedPlacements / certifiedTrainees) * 100) : 0;

  const verifiedEmploymentRate =
    certifiedTrainees > 0 ? Math.round((verifiedEmployment / certifiedTrainees) * 100) : 0;

  const retained6mCount = state.employmentOutcomes.filter(
    (eo) => eo.verificationStatus === "VERIFIED" && eo.retained6m
  ).length;

  const retained12mCount = state.employmentOutcomes.filter(
    (eo) => eo.verificationStatus === "VERIFIED" && eo.retained12m
  ).length;

  const retentionRate6m =
    verifiedEmployment > 0 ? Math.round((retained6mCount / verifiedEmployment) * 100) : 0;

  const retentionRate12m =
    verifiedEmployment > 0 ? Math.round((retained12mCount / verifiedEmployment) * 100) : 0;

  const selfEmployedCount = state.employmentOutcomes.filter(
    (eo) => eo.outcomeType === "SELF_EMPLOYED"
  ).length;

  const apprenticeshipCount = state.employmentOutcomes.filter(
    (eo) => eo.outcomeType === "APPRENTICESHIP"
  ).length;

  const pendingVerifications = state.verificationRequests.filter(
    (vr) => vr.status === "PENDING"
  ).length;

  return {
    totalTrainees,
    totalProviders,
    totalCourses,
    certifiedTrainees,
    reportedPlacements,
    verifiedEmployment,
    reportedEmploymentRate,
    verifiedEmploymentRate,
    retentionRate6m,
    retentionRate12m,
    averageSalaryBand: "₹18,500 / mo",
    selfEmployedCount,
    apprenticeshipCount,
    pendingVerifications,
  };
}

export function rankProvidersByOutcomeQuality(providers: Provider[]): Provider[] {
  return [...providers].sort((a, b) => {
    // Composite outcome score: 40% verified placement + 35% 6m retention + 25% 12m retention
    const scoreA = a.verifiedPlacementRate * 0.4 + a.retentionRate6m * 0.35 + a.retentionRate12m * 0.25;
    const scoreB = b.verifiedPlacementRate * 0.4 + b.retentionRate6m * 0.35 + b.retentionRate12m * 0.25;
    return scoreB - scoreA;
  });
}

export function getCohortDropoffFunnel(state: DatabaseState) {
  const enrolled = 100;
  const completed = 91;
  const certified = 84;
  const reportedPlaced = 68;
  const verifiedEmployment = 58;
  const retained30d = 56;
  const retained90d = 53;
  const retained180d = 48;
  const retained365d = 42;

  return [
    { stage: "Enrolled", count: enrolled, pct: 100, color: "#3B82F6" },
    { stage: "Completed Training", count: completed, pct: 91, color: "#6366F1" },
    { stage: "Certified", count: certified, pct: 84, color: "#8B5CF6" },
    { stage: "Reported Placed", count: reportedPlaced, pct: 68, color: "#EC4899" },
    { stage: "Verified Employment", count: verifiedEmployment, pct: 58, color: "#10B981" },
    { stage: "30-Day Retained", count: retained30d, pct: 56, color: "#059669" },
    { stage: "90-Day Retained", count: retained90d, pct: 53, color: "#047857" },
    { stage: "180-Day Retained", count: retained180d, pct: 48, color: "#065F46" },
    { stage: "365-Day Retained", count: retained365d, pct: 42, color: "#064E3B" },
  ];
}
