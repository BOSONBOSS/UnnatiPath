import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, Building2, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Unnati<span className="text-blue-600">Path</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Maharashtra's first longitudinal tracking system. We don't just count certificates — we track real career outcomes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
          {/* Government Dashboard Link */}
          <Link href="/government" className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Government Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-4">View state-wide analytics, district heatmaps, and skill gap AI insights.</p>
            <div className="text-blue-600 font-semibold flex items-center">
              Enter Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Trainee App Link */}
          <Link href="/trainee" className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Trainee Mobile App</h2>
            </div>
            <p className="text-gray-600 mb-4">Register new trainees and complete post-training employment surveys.</p>
            <div className="text-green-600 font-semibold flex items-center">
              Open Trainee App <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Employer Link */}
          <Link href="/employer" className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Employer Verification</h2>
            </div>
            <p className="text-gray-600 mb-4">Verify new hires securely via OTP to authenticate trainee placements.</p>
            <div className="text-purple-600 font-semibold flex items-center">
              Verify Employee <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Institution Link */}
          <Link href="/institution" className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Training Provider</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage your cohorts, record attendance, and view institution performance.</p>
            <div className="text-orange-600 font-semibold flex items-center">
              Provider Login <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
