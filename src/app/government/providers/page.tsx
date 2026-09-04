"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import { rankProvidersByOutcomeQuality } from "@/lib/analytics";
import {
  Building2,
  Search,
  ArrowUpDown,
  Check,
  Award
} from "lucide-react";

export default function ProvidersPage() {
  const { state } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "placement" | "retention">("score");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");

  const rankedProviders = rankProvidersByOutcomeQuality(state.providers);
  const districts = Array.from(new Set(state.providers.map((p) => p.district)));

  let filtered = rankedProviders.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === "ALL" || p.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "placement") return b.verifiedPlacementRate - a.verifiedPlacementRate;
    if (sortBy === "retention") return b.retentionRate6m - a.retentionRate6m;
    return (b.performanceScore || 0) - (a.performanceScore || 0);
  });

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Training Provider Performance Scorecard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Accredited institutes ranked by verified placement, 6-month retention, and long-term career stability.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
          Weighted Score: 40% Verified Placement + 35% 6M Retention + 25% 12M Retention
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search provider or district..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
          >
            <option value="ALL">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 font-medium"
          >
            <option value="score">Sort by Overall Score</option>
            <option value="placement">Sort by Verified Placement</option>
            <option value="retention">Sort by 6M Retention</option>
          </select>
        </div>
      </div>

      {/* Analytical Ranking Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                <th className="py-2.5 px-4">Provider Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Trainees</th>
                <th className="py-2.5 px-3">Completion Rate</th>
                <th className="py-2.5 px-3">Verified Placement</th>
                <th className="py-2.5 px-3">6M Retention</th>
                <th className="py-2.5 px-4 text-right">Outcome Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prov, idx) => (
                <tr key={prov.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{prov.name}</span>
                    <span className="text-[11px] text-slate-500">{4} accredited courses</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{prov.district}</td>
                  <td className="py-3 px-3 text-slate-700">{prov.totalTrainees}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {prov.placementRate}%
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">
                    {prov.verifiedPlacementRate}%
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {prov.retentionRate6m}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {(prov.performanceScore || (prov.verifiedPlacementRate * 0.4 + prov.retentionRate6m * 0.35 + prov.retentionRate12m * 0.25)).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
