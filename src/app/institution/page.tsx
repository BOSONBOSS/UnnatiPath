"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/db/store";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  Award,
  Users,
  BookOpen,
  Filter
} from "lucide-react";

export default function InstitutionPage() {
  const { state, verifyTrainingClaim, rejectTrainingClaim } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Biometric attendance below 70% threshold");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"VERIFICATIONS" | "TRAINEES" | "COURSES">("VERIFICATIONS");

  // Filter pending verification requests for this institution
  const pendingRequests = state.verificationRequests.filter(
    (r) => r.claimType === "TRAINING_VERIFICATION" && r.status === "PENDING"
  );

  const institutionRecords = state.trainingRecords.filter((tr) => tr.providerId === "prov-1");
  const institutionCourses = state.courses.filter((c) => c.providerId === "prov-1");

  const filteredRecords = institutionRecords.filter((rec) => {
    const trainee = state.trainees.find((t) => t.id === rec.traineeId);
    const matchesSearch =
      (trainee?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      rec.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.certificateId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "ALL" || rec.verificationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleVerify = (requestId: string, traineeName: string) => {
    verifyTrainingClaim(requestId, "Verified against MASI LMS Examination Ledger & Biometrics.");
    setSuccessToast(`Training credential for ${traineeName} verified.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenReject = (requestId: string) => {
    setActiveRequestId(requestId);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (activeRequestId) {
      rejectTrainingClaim(activeRequestId, rejectReason);
      setSuccessToast("Training credential rejected and logged.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
    setRejectModalOpen(false);
    setActiveRequestId(null);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Workspaces */}
      <div>
        <Link
          href="/roles"
          className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1"
        >
          &larr; Switch Workspace
        </Link>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Maharashtra Advanced Skill Institute (MASI)
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              DGT Registered
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Pune Campus &bull; Vocational Training &amp; NSQF Certification Ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${
              pendingRequests.length > 0
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {pendingRequests.length} {pendingRequests.length === 1 ? "claim" : "claims"} awaiting verification
          </span>
        </div>
      </div>

      {/* Operational Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Enrolled</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">420</p>
          <span className="text-[11px] text-slate-500">Across 2 campus centers</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Training Batches</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">14</p>
          <span className="text-[11px] text-slate-500">Active cohorts</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Certified Trainees</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">352</p>
          <span className="text-[11px] text-emerald-700 font-medium">83.8% completion</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pending Verifications</span>
          <p className={`text-2xl font-bold mt-1 ${pendingRequests.length > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {pendingRequests.length}
          </p>
          <span className="text-[11px] text-slate-500">Action items</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm">
        <button
          onClick={() => setActiveTab("VERIFICATIONS")}
          className={`pb-3 font-semibold text-xs transition border-b-2 flex items-center gap-2 ${
            activeTab === "VERIFICATIONS"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Verification Queue</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("TRAINEES")}
          className={`pb-3 font-semibold text-xs transition border-b-2 ${
            activeTab === "TRAINEES"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Trainee Registry ({filteredRecords.length})
        </button>

        <button
          onClick={() => setActiveTab("COURSES")}
          className={`pb-3 font-semibold text-xs transition border-b-2 ${
            activeTab === "COURSES"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Accredited Courses ({institutionCourses.length})
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === "VERIFICATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {pendingRequests.length > 0
                  ? `${pendingRequests.length} credential verification requests require your review`
                  : "No pending credential verifications"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm candidate attendance and exam ledger records to certify their training credentials.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Verification queue is clear</p>
              <p className="text-xs text-slate-500 mt-0.5">
                All student self-claims have been reviewed against institution exam ledgers.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 bg-white">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-slate-900">{req.traineeName}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Attendance Verified
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>
                        <span className="font-medium text-slate-800">{req.courseName || "CNC Programming"}</span>
                        <span className="text-slate-400 mx-1.5">&bull;</span>
                        Cert ID: <span className="font-mono text-slate-700">{req.certificateId || "CERT-2026-CNC"}</span>
                      </p>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1">
                        <span>Trainee ID: <span className="font-mono">{req.traineeId}</span></span>
                        <span>&bull;</span>
                        <span>Biometric Attendance: <strong className="text-slate-800">89%</strong></span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        Note: &ldquo;{req.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(req.id, req.traineeName)}
                      className="px-3.5 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Verify Credential
                    </button>
                    <button
                      onClick={() => handleOpenReject(req.id)}
                      className="px-3 py-1.5 rounded-md border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Trainee Registry */}
      {activeTab === "TRAINEES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, course, certificate..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="ALL">All Statuses ({institutionRecords.length})</option>
                <option value="VERIFIED">Verified Credential</option>
                <option value="PENDING">Pending Review</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2.5 px-4">Trainee</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3">Certificate ID</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Completion Date</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => {
                    const trainee = state.trainees.find((t) => t.id === rec.traineeId);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {trainee?.name || rec.traineeId}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{rec.courseName}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{rec.certificateId}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{rec.assessmentScore}%</td>
                        <td className="py-3 px-3 text-slate-500">{rec.completionDate}</td>
                        <td className="py-3 px-4 text-right">
                          {rec.verificationStatus === "VERIFIED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Accredited Courses */}
      {activeTab === "COURSES" && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Course Name</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3">QP Code</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-4 text-right">Placement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutionCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-3 text-slate-600">{c.sector}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{c.qpCode}</td>
                    <td className="py-3 px-3 text-slate-500">{c.durationDays} Days</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {c.placementRate || 75}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Reject Credential Claim</h3>
              <p className="text-xs text-slate-500 mt-1">
                State reason for rejecting this certificate claim. The record will be updated on the audit ledger.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700">Reason for Rejection</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="Biometric attendance below 70% threshold">Biometric attendance below 70% threshold</option>
                <option value="Course incomplete / practical assessment pending">Course incomplete / practical assessment pending</option>
                <option value="Invalid certificate ID / not found in ledger">Invalid certificate ID / not found in ledger</option>
                <option value="Duplicate registration mismatch">Duplicate registration mismatch</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
