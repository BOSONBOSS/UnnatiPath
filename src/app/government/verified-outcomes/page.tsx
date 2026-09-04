"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Check,
  Building2,
  FileCheck2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VerifiedOutcomesPage() {
  const { state } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");

  const outcomes = state.employmentOutcomes;

  const filteredOutcomes = outcomes.filter((outcome) => {
    const matchesSearch =
      outcome.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (outcome.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      outcome.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || outcome.verificationStatus === statusFilter;
    const matchesSector = sectorFilter === "ALL" || outcome.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const verifiedCount = outcomes.filter((o) => o.verificationStatus === "VERIFIED").length;
  const pendingCount = outcomes.filter((o) => o.verificationStatus === "PENDING").length;
  const disputedCount = outcomes.filter((o) => o.verificationStatus === "DISPUTED" || o.verificationStatus === "REJECTED").length;

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verified Outcomes Registry
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Longitudinal employment outcomes triangulated across institution training records, employer confirmation, and EPFO signals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            {verifiedCount} Verified
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            {pendingCount} Pending
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            {disputedCount} Disputed
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, employer, sector..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="ALL">All Outcomes ({outcomes.length})</option>
            <option value="VERIFIED">Verified Ground Truth</option>
            <option value="PENDING">Pending Employer</option>
            <option value="DISPUTED">Disputed / Rejected</option>
          </select>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="ALL">All Sectors</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Automotive">Automotive</option>
            <option value="IT/ITeS">IT/ITeS</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>
      </div>

      {/* Master Outcomes Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Candidate</th>
                <th className="py-2.5 px-3">Role &amp; Sector</th>
                <th className="py-2.5 px-3">Training Provider</th>
                <th className="py-2.5 px-3">Employer</th>
                <th className="py-2.5 px-3 text-center">Institution</th>
                <th className="py-2.5 px-3 text-center">Employer</th>
                <th className="py-2.5 px-3 text-center">EPFO</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOutcomes.map((outcome) => {
                const trainingRec = state.trainingRecords.find((tr) => tr.traineeId === outcome.traineeId);
                const isInstVerified = trainingRec?.verificationStatus === "VERIFIED" || outcome.institutionVerified;
                const isEmpVerified = outcome.employerVerified;
                const isOverallVerified = outcome.verificationStatus === "VERIFIED";

                return (
                  <tr key={outcome.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {outcome.traineeName}
                      <span className="text-[10px] text-slate-400 font-mono block">{outcome.traineeId}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">{outcome.jobRole}</span>
                      <span className="text-[11px] text-slate-500">{outcome.sector} &bull; {outcome.salaryBand}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {trainingRec?.providerName || "Maharashtra Advanced Skill Institute"}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-medium block">{outcome.employerName || "Direct Employment"}</span>
                      <span className="text-[10px] text-slate-400">Joined {outcome.startDate}</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isInstVerified ? (
                        <span className="text-emerald-700 font-bold text-xs">✓</span>
                      ) : (
                        <span className="text-amber-600 font-bold text-xs">&bull;</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isEmpVerified ? (
                        <span className="text-emerald-700 font-bold text-xs">✓</span>
                      ) : (
                        <span className="text-amber-600 font-bold text-xs">&bull;</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {outcome.epfoSignalVerified ? (
                        <span className="text-emerald-700 font-bold text-xs">✓</span>
                      ) : (
                        <span className="text-slate-300 text-xs">&mdash;</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isOverallVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      )}
                      {outcome.verificationStatus === "PENDING" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {(outcome.verificationStatus === "DISPUTED" || outcome.verificationStatus === "REJECTED") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Disputed
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
  );
}
