"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  MapPin,
  Building2,
  Users,
  History,
  TrendingUp
} from "lucide-react";

export function GovNav() {
  const pathname = usePathname();

  const TABS = [
    { href: "/government", label: "Overview", icon: BarChart3, exact: true },
    { href: "/government/verified-outcomes", label: "Verified Outcomes", icon: CheckCircle2 },
    { href: "/government/skill-gaps", label: "District Skill Gaps", icon: MapPin },
    { href: "/government/providers", label: "Provider Rankings", icon: Building2 },
    { href: "/government/cohorts", label: "Cohort Funnel", icon: TrendingUp },
    { href: "/government/audit-logs", label: "Audit Logs", icon: History },
  ];

  return (
    <div className="border-b border-slate-200 bg-white -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-200" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/roles"
          className="text-xs text-slate-500 hover:text-slate-900 font-medium whitespace-nowrap shrink-0 pl-3 border-l border-slate-200"
        >
          &larr; Switch Workspace
        </Link>
      </div>
    </div>
  );
}
