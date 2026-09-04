"use client";

import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import { getCohortDropoffFunnel } from "@/lib/analytics";
import {
  TrendingDown,
  ArrowDown,
  Check,
  ShieldCheck
} from "lucide-react";

export default function CohortsPage() {
  const { state } = useAppStore();
  const funnel = getCohortDropoffFunnel(state);

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cohort Outcome &amp; Drop-Off Funnel
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tracking 100 enrolled candidates through training, assessment, employer verification, and 12-month retention.
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
            Cohort 2026-A &bull; Longitudinal Tracking Active
          </div>
          <button 
            onClick={async () => {
              try {
                // We call the backend to generate the secure token and record the touchpoint in Supabase
                const res = await fetch("/api/followup/trigger", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ trainee_id: "demo-id", checkpoint_days: 90, target_phone: "simulated" })
                });
                const data = await res.json();
                
                if (data.link) {
                  // Simulate the user receiving the SMS and clicking the link
                  alert("Simulated SMS: Opening the secure mobile survey link...");
                  window.open(data.link, "_blank");
                } else {
                  alert("Error generating survey link: " + data.error);
                }
              } catch (e) {
                alert("Network error generating survey.");
              }
            }}
            className="text-xs bg-slate-900 text-white px-3 py-2 rounded-md font-semibold shadow-sm hover:bg-slate-800 transition flex items-center gap-2"
          >
            <span>Simulate 90-Day SMS Link</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Demo Safe</span>
          </button>
        </div>
      </div>

      {/* Stage-by-Stage Funnel */}
      <section className="p-6 rounded-xl border border-slate-200 bg-white space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Conversion Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-by-stage progression highlighting where trainees drop out of the employment trajectory.
          </p>
        </div>

        <div className="space-y-4">
          {funnel.map((step, idx) => {
            const prevCount = idx > 0 ? funnel[idx - 1].count : step.count;
            const drop = prevCount - step.count;
            const dropPercent = prevCount > 0 ? Math.round((drop / prevCount) * 100) : 0;

            return (
              <div key={step.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{step.stage}</span>
                    {idx === 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Employer Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {drop > 0 && (
                      <span className="text-[11px] text-rose-600 font-medium">
                        &minus;{drop} drop ({dropPercent}%)
                      </span>
                    )}
                    <span className="font-bold text-slate-900 text-sm">{step.count}% Trainees</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${step.pct}%`,
                      backgroundColor: idx === 4 ? "#059669" : idx >= 3 ? "#0284c7" : "#475569"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Structured Policy Takeaways */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1.5">
          <span className="font-semibold text-slate-900 block">1. Certification Drop-Off (16%)</span>
          <p className="text-slate-600 leading-relaxed">
            Candidates leaving prior to certification cited travel expenses to district training centers and conflicting agricultural harvest schedules.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1.5">
          <span className="font-semibold text-slate-900 block">2. Self-Reported vs. Verified (10%)</span>
          <p className="text-slate-600 leading-relaxed">
            10 out of 68 self-claimed placements could not be confirmed on active employer payroll, filtering unverified claims from state metrics.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1.5">
          <span className="font-semibold text-slate-900 block">3. 12-Month Stability (42%)</span>
          <p className="text-slate-600 leading-relaxed">
            42% of enrolled trainees maintain sustainable employment at 1 year. Trainees who followed AI upskilling guidance showed a 19% higher retention rate.
          </p>
        </div>
      </section>
    </div>
  );
}
