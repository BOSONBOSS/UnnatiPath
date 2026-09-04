"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/db/store";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  MapPin,
  Building2,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Award,
  TrendingUp,
  Check
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AiCareerService, AiRecommendation } from "@/lib/services/ai";

export default function TraineePage() {
  const { state, addTrainingClaim, addEmploymentClaim, submitFollowupResponse } = useAppStore();

  const trainee = state.trainees.find((t) => t.id === state.activeTraineeId) || state.trainees[0];
  const trainingRecord = state.trainingRecords.find((tr) => tr.traineeId === trainee.id);
  const employmentOutcome = state.employmentOutcomes.find((eo) => eo.traineeId === trainee.id);
  const followups = state.followupTouchpoints.filter((fp) => fp.traineeId === trainee.id);

  // Modals
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  // Training form state
  const [selectedProviderId, setSelectedProviderId] = useState(state.providers[0]?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState(state.courses[0]?.id || "");
  const [certificateId, setCertificateId] = useState("CERT-CNC-2026-0842");

  // Employment form state
  const [selectedEmployerId, setSelectedEmployerId] = useState(state.employers[0]?.id || "");
  const [jobRole, setJobRole] = useState("CNC Machine Operator");
  const [sector, setSector] = useState("Manufacturing");
  const [startDate, setStartDate] = useState("2026-08-15");
  const [salaryBand, setSalaryBand] = useState("₹18,000 - ₹22,000 / month");

  // Check-in form state
  const [checkinStatus, setCheckinStatus] = useState<"EMPLOYED" | "SEARCHING" | "SELF_EMPLOYED" | "APPRENTICESHIP">("SEARCHING");
  const [nonPlacementReason, setNonPlacementReason] = useState("Skill mismatch - CAD software proficiency required by local units");
  const [checkinFeedback, setCheckinFeedback] = useState("CNC machining taught well, but interviews insist on reading 2D/3D AutoCAD drawings.");

  // AI recommendations state
  const [aiInsights, setAiInsights] = useState<AiRecommendation[]>([
    {
      title: "Learn Parametric 3D CAD & Drafting",
      description: "Auto-ancillaries in Chakan & Bhosari offer a 30% wage premium for CNC machinists who can interpret CAD blueprints.",
      actionType: "BRIDGE_COURSE",
      confidenceScore: 0.95,
      timeToComplete: "3 weeks"
    },
    {
      title: "Explore Adjacent CMM Quality Control Roles",
      description: "Coordinate Measuring Machine inspection roles actively recruit CNC certified trainees at ₹22,000+/mo.",
      actionType: "ADJACENT_ROLE",
      confidenceScore: 0.90,
      timeToComplete: "Immediate"
    },
    {
      title: "Apply for DGT NAPS Apprenticeship",
      description: "Secure government-backed 6-month advanced manufacturing on-the-job training with stipend protection.",
      actionType: "CERTIFICATION",
      confidenceScore: 0.92,
      timeToComplete: "6 months"
    }
  ]);

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    addTrainingClaim(trainee.id, {
      providerId: selectedProviderId,
      courseId: selectedCourseId,
      enrollmentDate: "2026-03-01",
      completionDate: "2026-06-01",
      certificateId
    });
    setIsTrainingModalOpen(false);
  };

  const handleAddEmployment = (e: React.FormEvent) => {
    e.preventDefault();
    addEmploymentClaim(trainee.id, {
      employerId: selectedEmployerId,
      jobRole,
      sector,
      startDate,
      salaryBand
    });
    setIsEmploymentModalOpen(false);
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const touchpoint = followups.find((fp) => fp.checkpointDays === 90) || followups[0];
    if (touchpoint) {
      submitFollowupResponse(touchpoint.id, {
        employmentStatus: checkinStatus,
        jobRole: checkinStatus === "EMPLOYED" ? jobRole : undefined,
        nonPlacementReason: checkinStatus === "SEARCHING" ? nonPlacementReason : undefined,
        feedback: checkinFeedback
      });

      // Update AI insights
      const recommendations = await AiCareerService.generateCareerRecommendations({
        courseName: trainingRecord?.courseName || "CNC Operator",
        district: trainee.district,
        sector: "Manufacturing",
        employmentStatus: checkinStatus,
        nonPlacementReason: nonPlacementReason
      });
      setAiInsights(recommendations);
    }
    setIsCheckinModalOpen(false);
  };

  const isTrainingVerified = trainingRecord?.verificationStatus === "VERIFIED";
  const isEmploymentVerified = employmentOutcome?.verificationStatus === "VERIFIED";
  const is90DayDone = followups.find((fp) => fp.checkpointDays === 90)?.status === "RESPONDED";

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back to Workspaces */}
      <div>
        <Link
          href="/roles"
          className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1"
        >
          &larr; Switch Workspace
        </Link>
      </div>
      
      {/* 1. Trainee Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {trainee.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Verified Identity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {trainee.district}, Maharashtra • Candidate ID: <span className="font-mono text-slate-700">{trainee.pseudonymousId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTrainingModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Training</span>
          </button>
          <button
            onClick={() => setIsEmploymentModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employment</span>
          </button>
        </div>
      </div>

      {/* 2. 90-Day Longitudinal Check-in Notice (Compact) */}
      {!is90DayDone && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-slate-800 font-medium">
              Your 90-Day Career Check-in is due. Share your current placement status to unlock tailored career recommendations.
            </span>
          </div>
          <button
            onClick={() => setIsCheckinModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg whitespace-nowrap transition cursor-pointer"
          >
            Complete Check-in
          </button>
        </div>
      )}

      {/* 3. Primary Section: Your Journey */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Your Journey</h2>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1: Training */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                <span>Training</span>
              </div>
              <p className="text-xs text-slate-600 pl-7">{trainingRecord?.courseName || "CNC Operator"}</p>
              <p className="text-[11px] text-slate-400 pl-7">Attendance: {trainingRecord?.attendancePct || 92}%</p>
            </div>

            {/* Step 2: Certification */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                {isTrainingVerified ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">●</span>
                )}
                <span>Certification</span>
              </div>
              <p className="text-xs text-slate-600 pl-7 font-mono">{trainingRecord?.certificateId}</p>
              <p className="text-[11px] text-slate-400 pl-7">
                {isTrainingVerified ? "Verified by MASI Pune" : "Pending Institution Verification"}
              </p>
            </div>

            {/* Step 3: Employment */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                {isEmploymentVerified ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">●</span>
                )}
                <span>Employment</span>
              </div>
              <p className="text-xs text-slate-600 pl-7">{employmentOutcome?.employerName || "XYZ Precision Mfg"}</p>
              <p className="text-[11px] text-slate-400 pl-7">
                {isEmploymentVerified ? "Employer Confirmed ✓" : "Pending Employer Verification"}
              </p>
            </div>

            {/* Step 4: Retention */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${is90DayDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {is90DayDone ? "✓" : "4"}
                </span>
                <span>Retention & Growth</span>
              </div>
              <p className="text-xs text-slate-600 pl-7">
                {is90DayDone ? "90-Day Check-in Logged" : "30-Day Check-in Done"}
              </p>
              <p className="text-[11px] text-slate-400 pl-7">6M & 12M Checkpoints Scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Skills & Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
            Acquired NSQF Skills
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["CNC Turning & Milling", "Tooling Setup", "Shop-floor Safety", "Engineering Drawing", "G-Code Verification"].map((skill) => (
              <span key={skill} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
            Current Employment Status
          </span>
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isEmploymentVerified ? "bg-emerald-600" : "bg-amber-500"}`} />
              <span className="text-sm font-semibold text-slate-900">
                {employmentOutcome?.jobRole || "CNC Operator"} — {employmentOutcome?.employerName || "XYZ Precision Manufacturing"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Wage Band: {employmentOutcome?.salaryBand || "₹18,000 - ₹22,000 / mo"} • EPFO Signal: Active
            </p>
          </div>
        </div>
      </div>

      {/* 5. Career Next Steps / AI Recommendations */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Recommended Career Pathways</span>
          </h2>
          <span className="text-[11px] text-slate-400">Tailored to your skills & Pune district demand</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                  {insight.actionType.replace("_", " ")}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {insight.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{insight.timeToComplete}</span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Explore</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Detailed Records Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900">Registered Credentials & Records</h2>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Entity / Organization</th>
                <th className="py-2.5 px-4">Role / Certificate</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Training</td>
                <td className="py-3 px-4 text-slate-700">{trainingRecord?.providerName}</td>
                <td className="py-3 px-4 text-slate-700">{trainingRecord?.courseName} ({trainingRecord?.certificateId})</td>
                <td className="py-3 px-4 text-slate-500">June 2026</td>
                <td className="py-3 px-4">
                  {isTrainingVerified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Institution Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">Pending Institution Review</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-900">Employment</td>
                <td className="py-3 px-4 text-slate-700">{employmentOutcome?.employerName}</td>
                <td className="py-3 px-4 text-slate-700">{employmentOutcome?.jobRole}</td>
                <td className="py-3 px-4 text-slate-500">August 2026</td>
                <td className="py-3 px-4">
                  {isEmploymentVerified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Employer Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium">Pending Employer Confirmation</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD TRAINING */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Training Record</h3>
              <p className="text-slate-500 mt-0.5">Submit course details for institutional verification.</p>
            </div>

            <form onSubmit={handleAddTraining} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Training Institution</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {state.providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {state.courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sector})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Certificate Number</label>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EMPLOYMENT */}
      {isEmploymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Employment Placement</h3>
              <p className="text-slate-500 mt-0.5">Submit employment claim for employer confirmation.</p>
            </div>

            <form onSubmit={handleAddEmployment} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Employer</label>
                <select
                  value={selectedEmployerId}
                  onChange={(e) => setSelectedEmployerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {state.employers.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Job Designation</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sector</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Salary Range</label>
                <select
                  value={salaryBand}
                  onChange={(e) => setSalaryBand(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option>₹15,000 - ₹18,000 / month</option>
                  <option>₹18,000 - ₹22,000 / month</option>
                  <option>₹22,000 - ₹28,000 / month</option>
                  <option>₹28,000+ / month</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmploymentModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                >
                  Submit Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 90-DAY CHECK-IN */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">90-Day Milestone Check-in</h3>
              <p className="text-slate-500 mt-0.5">Your response updates district training intelligence.</p>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-800 mb-1.5">1. Current employment status</label>
                <div className="space-y-1">
                  {[
                    { val: "EMPLOYED", label: "Employed in a company" },
                    { val: "SEARCHING", label: "Looking for employment" },
                    { val: "SELF_EMPLOYED", label: "Self-employed" },
                    { val: "APPRENTICESHIP", label: "Apprenticeship" }
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="checkin_status"
                        checked={checkinStatus === opt.val}
                        onChange={() => setCheckinStatus(opt.val as any)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {checkinStatus === "SEARCHING" && (
                <div>
                  <label className="block font-medium text-slate-800 mb-1">2. Primary barrier to placement</label>
                  <select
                    value={nonPlacementReason}
                    onChange={(e) => setNonPlacementReason(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Skill mismatch - CAD software proficiency required by local units">
                      Skill mismatch (CAD drafting demanded by employers)
                    </option>
                    <option value="Lack of local industrial opportunities in district">
                      Lack of opportunities within commute radius
                    </option>
                    <option value="Wages offered below minimum expectation">
                      Wages offered below expectation
                    </option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium"
                >
                  Save & Update Recommendations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
