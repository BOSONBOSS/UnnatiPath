"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppStore } from "@/lib/db/store";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Landmark,
  ArrowRight
} from "lucide-react";
import { StakeholderRole } from "@/lib/types";

export default function RolesPage() {
  const router = useRouter();
  const { setCurrentRole } = useAppStore();

  const handleSelectRole = (role: StakeholderRole, route: string) => {
    setCurrentRole(role);
    router.push(route);
  };

  const WORKSPACES = [
    {
      id: "TRAINEE" as const,
      route: "/trainee",
      title: "Trainee",
      icon: GraduationCap,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
    },
    {
      id: "TRAINING_INSTITUTION" as const,
      route: "/institution",
      title: "Training Institution",
      icon: Building2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      id: "EMPLOYER" as const,
      route: "/employer",
      title: "Employer",
      icon: Briefcase,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
    },
    {
      id: "GOVERNMENT_OFFICER" as const,
      route: "/government",
      title: "Government Officer",
      icon: Landmark,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-800",
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-16">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Brand & Heading Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-14 sm:h-16 w-56 sm:w-64">
            <Image
              src="/logo.png"
              alt="UnnatiPath"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="pt-2 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Choose your workspace
            </h1>
            <p className="text-sm text-slate-500">
              Select your role to continue.
            </p>
          </div>
        </div>

        {/* 2x2 Minimal Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {WORKSPACES.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <button
                key={workspace.id}
                onClick={() => handleSelectRole(workspace.id, workspace.route)}
                className="group flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-150 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${workspace.iconBg} ${workspace.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-slate-950 truncate">
                    {workspace.title}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
