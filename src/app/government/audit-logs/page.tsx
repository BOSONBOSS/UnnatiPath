"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/db/store";
import { GovNav } from "@/components/government/GovNav";
import {
  History,
  Search,
  Check,
  ShieldCheck,
  FileCode,
  X
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const { state } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedLogMeta, setSelectedLogMeta] = useState<any | null>(null);

  const logs = state.auditLogs;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tableName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <GovNav />

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Immutable Audit Trail
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cryptographically timestamped activity ledger tracking all credential verifications, employment confirmations, and outcome updates.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
          {logs.length} Recorded Entries &bull; SHA-256 Chained
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or table..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 font-medium"
          >
            <option value="ALL">All Roles ({logs.length})</option>
            <option value="SYSTEM">System Automations</option>
            <option value="TRAINEE">Trainee Submissions</option>
            <option value="TRAINING_INSTITUTION">Training Institutions</option>
            <option value="EMPLOYER">Employer Verifications</option>
            <option value="GOVERNMENT_OFFICER">Government Officers</option>
          </select>
        </div>
      </div>

      {/* Chronological Activity Timeline */}
      <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-6">
        <div className="relative border-l-2 border-slate-200 ml-3.5 pl-6 space-y-8">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative">
              {/* Timeline Bullet */}
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />

              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-900">{log.action}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
                  <span>Actor: <strong className="text-slate-800">{log.actorName}</strong></span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                    {log.actorRole}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 font-mono text-[11px]">Table: {log.tableName}</span>
                </div>

                {log.recordId && (
                  <div className="pt-2 flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-400">Record: {log.recordId}</span>
                    <button
                      onClick={() => setSelectedLogMeta(log)}
                      className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-medium"
                    >
                      View payload metadata &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payload Modal */}
      {selectedLogMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Record Metadata</h3>
                <span className="text-[11px] font-mono text-slate-400">ID: {selectedLogMeta.id}</span>
              </div>
              <button
                onClick={() => setSelectedLogMeta(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p><strong>Action:</strong> {selectedLogMeta.action}</p>
                <p><strong>Actor:</strong> {selectedLogMeta.actorName} ({selectedLogMeta.actorRole})</p>
                <p><strong>Timestamp:</strong> {formatDate(selectedLogMeta.createdAt)}</p>
                <p><strong>Target Table:</strong> {selectedLogMeta.tableName}</p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">Payload:</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLogMeta.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogMeta(null)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
