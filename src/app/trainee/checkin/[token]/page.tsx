"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Award,
  Briefcase,
  Search,
  Wrench,
  GraduationCap
} from "lucide-react";

type SurveyState = "LOADING" | "READY" | "SUBMITTING" | "SUCCESS" | "ALREADY_DONE" | "ERROR";

export default function CheckinSurveyPage() {
  const params = useParams();
  const token = params.token as string;

  const [surveyState, setSurveyState] = useState<SurveyState>("LOADING");
  const [checkpointDays, setCheckpointDays] = useState(90);
  const [traineeName, setTraineeName] = useState("there");
  const [errorMsg, setErrorMsg] = useState("");

  // Form state
  const [employed, setEmployed] = useState<boolean | null>(null);
  const [employerName, setEmployerName] = useState("");
  const [salaryBand, setSalaryBand] = useState("15000-18000");
  const [sector, setSector] = useState("Manufacturing");
  const [reason, setReason] = useState("");

  // Badge state
  const [badge, setBadge] = useState("");

  useEffect(() => {
    async function loadSurvey() {
      try {
        const res = await fetch(`/api/checkin/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "Invalid survey link.");
          setSurveyState("ERROR");
          return;
        }

        if (data.already_done) {
          setSurveyState("ALREADY_DONE");
          return;
        }

        setCheckpointDays(data.checkpoint_days);
        setTraineeName(data.trainee_name);
        setSurveyState("READY");
      } catch (err) {
        setErrorMsg("Could not load the survey. Please try again later.");
        setSurveyState("ERROR");
      }
    }

    if (token) loadSurvey();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyState("SUBMITTING");

    try {
      const res = await fetch(`/api/checkin/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employed,
          employer_name: employed ? employerName : undefined,
          salary_band: employed ? salaryBand : undefined,
          sector: employed ? sector : undefined,
          reason: !employed ? reason : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed.");
        setSurveyState("ERROR");
        return;
      }

      setBadge(data.badge || "starter");
      setSurveyState("SUCCESS");
    } catch (err) {
      setErrorMsg("Network error. Please check your connection and try again.");
      setSurveyState("ERROR");
    }
  };

  // --- LOADING STATE ---
  if (surveyState === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Loading your survey...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (surveyState === "ERROR") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
          <p className="text-sm text-slate-600">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // --- ALREADY DONE STATE ---
  if (surveyState === "ALREADY_DONE") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Already Submitted</h2>
          <p className="text-sm text-slate-600">
            You have already completed this check-in survey. Thank you for your contribution!
          </p>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  if (surveyState === "SUCCESS") {
    const badgeLabels: Record<string, string> = {
      starter: "Career Starter",
      milestone_reporter: "Milestone Reporter",
      career_achiever: "Career Achiever",
      annual_champion: "Annual Champion",
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Thank you, {traineeName}!</h2>
            <p className="text-sm text-slate-600 mt-1">
              Your response has been recorded. It directly helps improve skilling programs across Maharashtra.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm font-semibold text-blue-800">
            <Award className="w-4 h-4" />
            <span>Badge Earned: {badgeLabels[badge] || "Career Starter"}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- READY STATE: The actual survey form ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UnnatiPath Check-in</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Hi {traineeName}, how are things going?
          </h1>
          <p className="text-sm text-slate-500">
            It has been {checkpointDays} days since your training. Please share a quick update on your employment status.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Question 1: Are you employed? */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              1. Are you currently employed?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEmployed(true)}
                className={`p-3.5 rounded-xl border text-sm font-medium flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  employed === true
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Yes, employed</span>
              </button>
              <button
                type="button"
                onClick={() => setEmployed(false)}
                className={`p-3.5 rounded-xl border text-sm font-medium flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  employed === false
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Still searching</span>
              </button>
            </div>
          </div>

          {/* Conditional: Employed Details */}
          {employed === true && (
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employer Name</label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. XYZ Manufacturing Ltd."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                  <select
                    value={salaryBand}
                    onChange={(e) => setSalaryBand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="10000-15000">Rs 10,000 - 15,000</option>
                    <option value="15000-18000">Rs 15,000 - 18,000</option>
                    <option value="18000-22000">Rs 18,000 - 22,000</option>
                    <option value="22000-28000">Rs 22,000 - 28,000</option>
                    <option value="28000+">Rs 28,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option>Manufacturing</option>
                    <option>IT / Software</option>
                    <option>Healthcare</option>
                    <option>Retail</option>
                    <option>Construction</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Conditional: Not Employed - Reason */}
          {employed === false && (
            <div className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. What is the main reason you have not found a job yet?
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white"
                required
              >
                <option value="">Select a reason...</option>
                <option value="Skill mismatch - employers require CAD software proficiency">Skill mismatch (employers want different skills)</option>
                <option value="No job opportunities in my area">No opportunities in my area</option>
                <option value="Wages offered are too low">Wages offered are too low</option>
                <option value="Personal or family reasons">Personal or family reasons</option>
                <option value="Still in apprenticeship or further training">Still in apprenticeship or further training</option>
              </select>
            </div>
          )}

          {/* Submit */}
          {employed !== null && (
            <button
              type="submit"
              disabled={surveyState === "SUBMITTING"}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {surveyState === "SUBMITTING" ? "Submitting..." : "Submit My Update"}
            </button>
          )}
        </form>

        <p className="text-[11px] text-slate-400 text-center">
          Your response is confidential and used only to improve government skilling programs.
        </p>
      </div>
    </div>
  );
}
