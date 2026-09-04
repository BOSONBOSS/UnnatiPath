"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/db/store";
import {
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText
} from "lucide-react";

export default function EmployerPage() {
  const { state, verifyEmploymentClaim, rejectEmploymentClaim } = useAppStore();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("No matching joining record on HRMS");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // Filter pending employment verification requests
  const pendingRequests = state.verificationRequests.filter(
    (r) => r.claimType === "EMPLOYMENT_VERIFICATION" && r.status === "PENDING"
  );

  const employerOutcomes = state.employmentOutcomes.filter(
    (eo) => eo.employerId === "emp-1" || eo.verificationStatus === "VERIFIED"
  );

  const handleVerify = (requestId: string, traineeName: string) => {
    verifyEmploymentClaim(requestId, "Confirmed active on company payroll under PF MH/PUN/0048192/000.");
    setSuccessToast(`Employment for ${traineeName} confirmed as verified outcome.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleOpenReject = (requestId: string) => {
    setActiveRequestId(requestId);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (activeRequestId) {
      rejectEmploymentClaim(activeRequestId, rejectReason);
      setSuccessToast("Employment claim rejected and recorded.");
      setTimeout(() => setSuccessToast(null), 3500);
    }
    setRejectModalOpen(false);
    setActiveRequestId(null);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Workspaces */}
      <div>
        <Link
          href="/roles"
          className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1"
        >
          &larr; Switch Workspace
        </Link>
      </div>

      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Simplified Enterprise Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                XYZ Precision Manufacturing Ltd.
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" /> Verified Enterprise
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Bhosari MIDC, Pune &bull; Precision Automotive Ancillaries
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
              {pendingRequests.length} {pendingRequests.length === 1 ? "verification" : "verifications"} pending
            </span>

            <button
              onClick={() => setShowCompanyDetails(!showCompanyDetails)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50"
            >
              <span>{showCompanyDetails ? "Hide details" : "Company details"}</span>
              {showCompanyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Company Details */}
        {showCompanyDetails && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">PF Registration Code</span>
              <span className="font-mono font-medium text-slate-800">MH/PUN/0048192/000</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Sector</span>
              <span className="font-medium text-slate-800">Automotive & Capital Goods</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Authorized HR Contact</span>
              <span className="font-medium text-slate-800">hr.operations@xyzprecision.in</span>
            </div>
          </div>
        )}
      </div>

      {/* PRIMARY SECTION: Pending Employment Verifications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {pendingRequests.length > 0
                ? `${pendingRequests.length} employment ${
                    pendingRequests.length === 1 ? "verification requires" : "verifications require"
                  } your action`
                : "No pending verification requests"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Validate employment claims submitted by trained candidates to generate official verified outcomes.
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">All employment claims verified</p>
            <p className="text-xs text-slate-500 mt-0.5">
              New verification requests will appear here when candidates submit placement records with your organization.
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
                      Action Required
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>
                      <span className="font-medium text-slate-800">{req.jobRole || "CNC Machine Operator"}</span>
                      <span className="text-slate-400 mx-1.5">&bull;</span>
                      Joining date: <span className="font-medium">{req.startDate || "15 Aug 2026"}</span>
                    </p>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1">
                      <span>Trainee ID: <span className="font-mono">{req.traineeId}</span></span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-medium">EPFO Match: Confirmed ✓</span>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1.5">
                      Note: &ldquo;{req.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify(req.id, req.traineeName)}
                    className="px-3.5 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleOpenReject(req.id)}
                    className="px-3 py-1.5 rounded-md border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => alert("Flagged for internal HR follow-up.")}
                    className="px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECONDARY SECTION: Verified Trainees Roster */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Verified Trainees On Payroll</h2>
            <p className="text-xs text-slate-500">
              Government-verified candidates currently placed and active in your organization.
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
            {employerOutcomes.filter((eo) => eo.verificationStatus === "VERIFIED").length} Active
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joining Date</th>
                  <th className="py-2.5 px-3">Salary Band</th>
                  <th className="py-2.5 px-3">6M Retention</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employerOutcomes.slice(0, 8).map((outcome) => (
                  <tr key={outcome.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {outcome.traineeName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{outcome.jobRole}</td>
                    <td className="py-3 px-3 text-slate-500">{outcome.startDate || "15 Aug 2026"}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{outcome.salaryBand}</td>
                    <td className="py-3 px-3">
                      {outcome.retained6m ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <Check className="w-3 h-3" /> Retained
                        </span>
                      ) : (
                        <span className="text-slate-400">Tracking</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {outcome.verificationStatus === "VERIFIED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified Outcome
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Reject Employment Claim</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select reason for declining this candidate&apos;s placement claim. This will update the state registry and notify the candidate.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700">Reason for Non-Confirmation</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              >
                <option value="No matching joining record on HRMS">No matching joining record on HRMS</option>
                <option value="Candidate offered but did not join">Candidate offered but did not join</option>
                <option value="Separated within probation / not active">Separated within probation / not active</option>
                <option value="Contractor / third-party payroll not direct">Contractor / third-party payroll not direct</option>
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
