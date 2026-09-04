"use client";

import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import { calculateGovernmentKpis, rankProvidersByOutcomeQuality } from "@/lib/analytics";
import {
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileCheck2
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function GovernmentOverviewPage() {
  const { state } = useAppStore();
  const kpis = calculateGovernmentKpis(state);
  const rankedProviders = rankProvidersByOutcomeQuality(state.providers);

  const pendingCount = state.verificationRequests.filter((r) => r.status === "PENDING").length;
  const recentLogs = state.auditLogs.slice(0, 5);

  const verificationGap = Math.max(0, kpis.reportedEmploymentRate - kpis.verifiedEmploymentRate);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Government Outcome Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Directorate of Vocational Education &amp; Training &bull; Maharashtra Pilot
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/government/verified-outcomes"
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition"
          >
            <span>View Outcomes Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* CORE OUTCOME INSIGHT: Reported vs Verified (Restrained GovTech Style) */}
      <section className="p-6 rounded-xl border border-slate-200 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">Employment Outcome Verification</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ground Truth Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Employer confirmations and EPFO signals are triangulated to validate candidate self-claims.
            </p>
          </div>

          <div className="flex items-baseline gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Verification Gap:</span>
            <span className="text-base font-bold text-amber-700">
              {verificationGap} percentage points
            </span>
          </div>
        </div>

        {/* Progress Comparison Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Reported Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Reported Employment Claims</span>
              <span className="font-bold text-slate-900">{kpis.reportedEmploymentRate}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${kpis.reportedEmploymentRate}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              {kpis.reportedPlacements} candidate self-reported claims
            </span>
          </div>

          {/* Verified Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Verified Ground Truth</span>
              <span className="font-bold text-emerald-700">{kpis.verifiedEmploymentRate}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${kpis.verifiedEmploymentRate}%` }}
              />
            </div>
            <span className="text-[11px] text-emerald-700 font-medium block">
              {kpis.verifiedEmployment} confirmed by employers on payroll
            </span>
          </div>
        </div>
      </section>

      {/* 4 SUPPORTING OPERATIONAL METRICS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Trainees</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalTrainees}</p>
          <span className="text-[11px] text-slate-500">10 pilot districts</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Accredited Providers</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalProviders}</p>
          <span className="text-[11px] text-slate-500">15 registered courses</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">6-Month Retention</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.retentionRate6m}%</p>
          <span className="text-[11px] text-emerald-700 font-medium">Longitudinal stability</span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pending Verifications</span>
          <p className={`text-2xl font-bold mt-1 ${pendingCount > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {pendingCount}
          </p>
          <span className="text-[11px] text-slate-500">Awaiting institution/employer</span>
        </div>
      </section>

      {/* PROVIDER RANKING TABLE (Replaces giant 4 cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Training Provider Performance</h2>
            <p className="text-xs text-slate-500">
              Ranked by verified employment rate and 6-month retention outcomes.
            </p>
          </div>
          <Link
            href="/government/providers"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <span>Full scorecard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                <th className="py-2.5 px-4">Provider</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Verified Placement</th>
                <th className="py-2.5 px-3">6M Retention</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedProviders.map((prov, idx) => (
                <tr key={prov.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                    0{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {prov.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{prov.district}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">
                    {prov.verifiedPlacementRate}%
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {prov.retentionRate6m}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/government/providers"
                      className="text-xs text-slate-600 hover:text-slate-900 hover:underline font-medium"
                    >
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECENT AUDIT TIMELINE (Replaces cluttered boxes) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Audit &amp; Verification Activity</h2>
            <p className="text-xs text-slate-500">
              Chronological ledger of trainee claims, employer verifications, and status updates.
            </p>
          </div>
          <Link
            href="/government/audit-logs"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <span>Complete log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
          {recentLogs.map((log, idx) => (
            <div key={log.id} className="flex items-start gap-3.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{log.action}</p>
                  <span className="text-[11px] text-slate-400">{formatDate(log.createdAt)}</span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Actor: <strong className="text-slate-800">{log.actorName}</strong> ({log.actorRole}) &bull; Target: {log.tableName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
