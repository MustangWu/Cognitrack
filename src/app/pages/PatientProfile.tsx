import { Navigation } from "../components/Navigation";
import { useParams, Link } from "react-router";

// Mock person data
const personData = {
  id: "PT-2024-001",
  name: "Margaret Thompson",
  dob: "15/06/1947",
  age: 78,
  gender: "Female",
  currentRisk: "High Risk",
};

// Mock visit history
const visits = [
  {
    date: "2026-03-15",
    mlu: 4.2,
    pauseRatio: 68,
    ttr: 0.42,
    fillerCount: 47,
    risk: "High Risk",
    trend: "down",
  },
  {
    date: "2026-01-10",
    mlu: 5.8,
    pauseRatio: 52,
    ttr: 0.51,
    fillerCount: 34,
    risk: "Moderate Risk",
    trend: "down",
  },
  {
    date: "2025-10-22",
    mlu: 7.1,
    pauseRatio: 38,
    ttr: 0.64,
    fillerCount: 22,
    risk: "Moderate Risk",
    trend: "down",
  },
  {
    date: "2025-07-05",
    mlu: 8.9,
    pauseRatio: 32,
    ttr: 0.71,
    fillerCount: 14,
    risk: "Low Risk",
    trend: "stable",
  },
  {
    date: "2025-04-18",
    mlu: 9.4,
    pauseRatio: 28,
    ttr: 0.76,
    fillerCount: 11,
    risk: "Low Risk",
    trend: "stable",
  },
];

export function PersonProfile() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/persons"
          className="inline-block text-gray-700 mb-6 underline"
        >
          ← Back to Person List
        </Link>
        
        {/* Person Summary Header */}
        <div className="bg-white border-2 border-gray-400 p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {personData.name}
                </h1>
                <div className="inline-block px-3 py-1 border-2 border-gray-900 font-bold text-sm bg-gray-200">
                  {personData.currentRisk}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6 text-sm">
                <div>
                  <p className="text-gray-700">Person ID</p>
                  <p className="font-bold text-gray-900">{personData.id}</p>
                </div>
                <div>
                  <p className="text-gray-700">Date of Birth</p>
                  <p className="font-bold text-gray-900">{personData.dob}</p>
                </div>
                <div>
                  <p className="text-gray-700">Age</p>
                  <p className="font-bold text-gray-900">{personData.age} years</p>
                </div>
                <div>
                  <p className="text-gray-700">Gender</p>
                  <p className="font-bold text-gray-900">{personData.gender}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visit History Table */}
        <div className="bg-white border-2 border-gray-400 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Visit History</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-gray-400">
              <thead>
                <tr className="border-b-2 border-gray-400 bg-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">MLU</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Pause Ratio</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">TTR</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Filler Count</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium border-r border-gray-300">
                      {new Date(visit.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 border-r border-gray-300">
                      {visit.mlu} {visit.trend === "down" && "↓"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 border-r border-gray-300">
                      {visit.pauseRatio}% {visit.trend === "down" && "↑"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 border-r border-gray-300">
                      {visit.ttr} {visit.trend === "down" && "↓"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 border-r border-gray-300">
                      {visit.fillerCount}/min {visit.trend === "down" && "↑"}
                    </td>
                    <td className="py-4 px-4 text-sm border-r border-gray-300">
                      <span className="inline-block px-3 py-1 border border-gray-900 text-xs font-bold bg-gray-100">
                        {visit.risk}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <Link 
                        to="/results"
                        className="text-gray-900 underline font-bold"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Trend Chart */}
        <div className="bg-white border-2 border-gray-400 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Longitudinal Biomarker Trends</h2>
          <p className="text-sm text-gray-700 mb-6">Track changes in speech biomarkers over time</p>
          <div className="w-full h-[400px] bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
            <p className="text-gray-700 font-medium">Chart: Longitudinal Biomarker Trends</p>
          </div>
        </div>
      </div>
    </div>
  );
}
