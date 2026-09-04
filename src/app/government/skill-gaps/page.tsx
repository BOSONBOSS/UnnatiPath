"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import {
  MapPin,
  TrendingDown,
  Search,
  Check,
  AlertCircle
} from "lucide-react";

export default function SkillGapsPage() {
  const { state } = useAppStore();
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");

  const signals = state.skillGapSignals;
  const currentSignal = signals.find((s) => s.district === selectedDistrict) || signals[0];

  const districts = Array.from(new Set(signals.map((s) => s.district)));
  const sectors = Array.from(new Set(signals.map((s) => s.sector)));

  const filteredSignals = signals.filter((s) => {
    return sectorFilter === "ALL" || s.sector === sectorFilter;
  });

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            District Skill Gaps &amp; Industry Alignment
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Triangulating employer recruitment demand against certified training output to identify structural deficits.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
          {districts.length} Pilot Districts Analyzed
        </div>
      </div>

      {/* Analytical Table: District Demand vs Available Talent */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">District Skill Gap Ledger</h2>
            <p className="text-xs text-slate-500">
              Comparative balance of industry hiring demand versus certified candidate placements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Filter Sector:</label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Sectors ({sectors.length})</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4">District</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Sector</th>
                  <th className="py-2.5 px-3 text-right">Employer Demand</th>
                  <th className="py-2.5 px-3 text-right">Placement Rate</th>
                  <th className="py-2.5 px-4">High-Deficit Skills</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSignals.map((sig) => {
                  const isSelected = sig.district === selectedDistrict;

                  return (
                    <tr
                      key={sig.id}
                      onClick={() => setSelectedDistrict(sig.district)}
                      className={`cursor-pointer transition ${
                        isSelected ? "bg-slate-50 font-medium" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sig.district}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{sig.courseName}</td>
                      <td className="py-3 px-3 text-slate-600">{sig.sector}</td>
                      <td className="py-3 px-3 text-right text-slate-900 font-medium">
                        {sig.employerDemandScore.toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                        {sig.placementRate.toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {sig.topMissingSkills.slice(0, 2).join(", ")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDistrict(sig.district);
                          }}
                          className={`text-xs ${
                            isSelected ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Details &rarr;"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* District Detail Scorecard */}
      <section className="p-6 rounded-xl border border-slate-200 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selected District Diagnostic
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentSignal.district} &bull; {currentSignal.courseName}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500">Employer Demand: </span>
              <strong className="text-slate-900">{currentSignal.employerDemandScore}%</strong>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">Placement Rate: </span>
              <strong className="text-slate-900">{currentSignal.placementRate}%</strong>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">Avg Time to Placement: </span>
              <strong className="text-slate-900">{currentSignal.avgDaysToPlacement} days</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Missing Skills */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Missing Competencies Cited by Employers</h4>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 divide-y divide-slate-200">
              {currentSignal.topMissingSkills.map((skill) => (
                <div key={skill} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                  <span className="text-slate-800 font-medium">{skill}</span>
                  <span className="text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
                    High Deficit
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reported Non-Placement Reasons */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Primary Reasons for Non-Placement</h4>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 divide-y divide-slate-200">
              {currentSignal.nonPlacementReasons.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2 text-slate-700">
                  <span className="leading-snug">{item.reason}</span>
                  <span className="text-slate-900 font-bold font-mono shrink-0">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
