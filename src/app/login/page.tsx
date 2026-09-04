"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  GraduationCap,
  Award,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Landmark,
  Check,
  Info
} from "lucide-react";
import { DigiLockerService } from "@/lib/services/digilocker";

export default function LoginPage() {
  const router = useRouter();

  // Mock DigiLocker Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"INPUT" | "OTP" | "VERIFYING" | "SUCCESS">("INPUT");
  const [identifier, setIdentifier] = useState("9820084729");
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState("");
  const [verifiedData, setVerifiedData] = useState<any>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setStep("INPUT");
    setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || identifier.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setStep("OTP");
    setOtp("847291"); // Demo convenient default
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Consent is required to continue with DigiLocker.");
      return;
    }
    setError("");
    setStep("VERIFYING");

    try {
      const result = await DigiLockerService.verifyOtpAndConsent(identifier, otp, consent);
      setVerifiedData(result);
      setStep("SUCCESS");

      // Redirect to /roles after brief confirmation
      setTimeout(() => {
        router.push("/roles");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      setStep("OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      
      {/* Subtle background ambient tint */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-blue-50/60 via-slate-50/30 to-transparent rounded-full pointer-events-none blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-emerald-50/40 via-slate-50/20 to-transparent rounded-full pointer-events-none blur-3xl -z-10" />

      {/* Top Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 pb-4">
        <div className="text-[11px] font-medium text-slate-400">
          Government of Maharashtra • Skill Development Initiative
        </div>
      </div>

      {/* Main Two-Column Content */}
      <div className="w-full max-w-6xl mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center z-10">
        
        {/* ================= LEFT SIDE: Brand + Journey ================= */}
        <div className="lg:col-span-7 space-y-7">
          
          {/* Official Logo (Enlarged, Clear & Prominent) */}
          <div>
            <div className="relative h-20 sm:h-24 w-80 sm:w-96">
              <Image
                src="/logo.png"
                alt="UnnatiPath - From Training to Growth"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mt-2.5 pl-1">
              FROM TRAINING TO GROWTH
            </p>
          </div>

          {/* Main Heading & Description */}
          <div className="space-y-3 pt-1">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              From Training to Growth
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-lg">
              One place to track your training, employment and career journey.
            </p>
          </div>

          {/* Simple Horizontal Journey (Training → Certification → Employment → Growth) */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-2 relative max-w-lg">
              {/* Connecting line behind icons */}
              <div className="absolute top-5 left-8 right-8 h-[1.5px] bg-slate-200 -z-0" />

              {/* 1. Training */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 group-hover:border-blue-300 transition">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-900 mt-2.5">Training</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Learn new skills</span>
              </div>

              {/* 2. Certification */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 group-hover:border-blue-300 transition">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-900 mt-2.5">Certification</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Get certified</span>
              </div>

              {/* 3. Employment */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 group-hover:border-emerald-300 transition">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-slate-900 mt-2.5">Employment</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Find jobs</span>
              </div>

              {/* 4. Growth */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-emerald-800 mt-2.5">Growth</span>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5">Better future</span>
              </div>
            </div>
          </div>

          {/* Subtle minimal growth curve graphic */}
          <div className="pt-4 max-w-lg opacity-40">
            <svg viewBox="0 0 400 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8 text-slate-300">
              <path d="M2 30C100 30 180 20 260 12C320 6 360 3 398 2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="398" cy="2" r="2.5" fill="#10B981" />
            </svg>
          </div>

        </div>

        {/* ================= RIGHT SIDE: Human-Designed Login Card ================= */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 space-y-6 relative">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure • Simple • Trusted</span>
            </div>

            {/* Card Header */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome to UnnatiPath
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                Continue securely with DigiLocker to access your journey.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-4 pt-1">
              <button
                onClick={handleOpenModal}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-slate-300 group-hover:text-white transition" />
                <span>Continue with DigiLocker</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition ml-1" />
              </button>

              {/* Consent Note Banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center gap-2 text-xs text-slate-600">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Your information is shared only with your consent.</span>
              </div>
            </div>

            {/* 3 Simple Trust Indicators */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your information stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secure identity verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You control what you share</span>
              </div>
            </div>

            {/* Demo Note */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                DigiLocker authentication is a simulated demo experience.
              </p>
            </div>

          </div>
        </div>

      </div>


      {/* ================= REALISTIC MOCK DIGILOCKER MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  DL
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    DigiLocker Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Identity Verification (Demo)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Step 1: Input Mobile / Reference */}
            {step === "INPUT" && (
              <form onSubmit={handleSendOtp} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Demo phone reference pre-filled for hackathon evaluation.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Verification & Consent */}
            {step === "OTP" && (
              <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Enter the OTP sent to your registered mobile number
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-center font-mono tracking-widest text-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>Demo OTP: <strong>847291</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp("847291")}
                      className="text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Autofill OTP
                    </button>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-snug">
                      I consent to securely verify my identity and create my <strong>UnnatiPath</strong> profile.
                    </span>
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("INPUT")}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Identity</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Verifying Animation */}
            {step === "VERIFYING" && (
              <div className="py-10 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
                <h4 className="text-sm font-semibold text-slate-800">Verifying Identity...</h4>
                <p className="text-xs text-slate-400">Please wait a moment...</p>
              </div>
            )}

            {/* Step 4: Success State */}
            {step === "SUCCESS" && (
              <div className="py-6 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Identity Verified</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your secure UnnatiPath identity has been created.
                  </p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-semibold text-emerald-800">
                    ID: {verifiedData?.pseudonymousId || "DL-8472-X4"}
                  </div>
                </div>
                <p className="text-xs font-medium text-blue-600 animate-pulse pt-2">
                  Continuing to role selection...
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
