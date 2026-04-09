import { Navigation } from "../components/Navigation";
import { useState } from "react";
import { Link } from "react-router";

// Mock patient data
const patients = [
  {
    id: "PT-2024-001",
    name: "Margaret Thompson",
    age: 78,
    lastVisit: "2026-03-15",
    risk: "High Risk",
    trend: "down",
    mlu: 4.2,
    flagged: true,
  },
  {
    id: "PT-2024-003",
    name: "Robert Chen",
    age: 72,
    lastVisit: "2026-03-12",
    risk: "High Risk",
    trend: "down",
    mlu: 5.1,
    flagged: true,
  },
  {
    id: "PT-2024-008",
    name: "Patricia O'Brien",
    age: 69,
    lastVisit: "2026-03-10",
    risk: "Moderate Risk",
    trend: "down",
    mlu: 6.8,
    flagged: false,
  },
  {
    id: "PT-2024-012",
    name: "John Williams",
    age: 75,
    lastVisit: "2026-03-08",
    risk: "Moderate Risk",
    trend: "stable",
    mlu: 7.2,
    flagged: false,
  },
  {
    id: "PT-2024-015",
    name: "Helen Morrison",
    age: 66,
    lastVisit: "2026-02-28",
    risk: "Low Risk",
    trend: "up",
    mlu: 9.1,
    flagged: false,
  },
  {
    id: "PT-2024-019",
    name: "David Kumar",
    age: 71,
    lastVisit: "2026-02-25",
    risk: "Low Risk",
    trend: "stable",
    mlu: 8.7,
    flagged: false,
  },
  {
    id: "PT-2024-022",
    name: "Susan Taylor",
    age: 68,
    lastVisit: "2026-02-15",
    risk: "Moderate Risk",
    trend: "down",
    mlu: 6.4,
    flagged: true,
  },
  {
    id: "PT-2024-027",
    name: "James Anderson",
    age: 74,
    lastVisit: "2026-01-30",
    risk: "Low Risk",
    trend: "up",
    mlu: 9.8,
    flagged: false,
  },
];

// Calculate overdue patients (last visit > 90 days ago)
const overduePatients = patients.filter(p => {
  const daysSinceVisit = Math.floor((new Date().getTime() - new Date(p.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceVisit > 90;
});

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "All" || patient.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const flaggedPatients = patients.filter(p => p.flagged);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient List
          </h1>
          <p className="text-gray-700">
            Manage and monitor your patients' cognitive health assessments
          </p>
        </div>
        
        {/* Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-l-4 border-gray-900 p-6 border-2 border-gray-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500"></div>
              <h3 className="text-lg font-bold text-gray-900">Flagged Patients</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{flaggedPatients.length}</div>
            <p className="text-sm text-gray-700">High-risk patients requiring follow-up</p>
          </div>
          
          <div className="bg-white border-l-4 border-gray-900 p-6 border-2 border-gray-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500"></div>
              <h3 className="text-lg font-bold text-gray-900">Overdue Recordings</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{overduePatients.length}</div>
            <p className="text-sm text-gray-700">Patients due for reassessment (&gt;90 days)</p>
          </div>
          
          <div className="bg-white border-l-4 border-gray-900 p-6 border-2 border-gray-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500"></div>
              <h3 className="text-lg font-bold text-gray-900">Total Active Patients</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{patients.length}</div>
            <p className="text-sm text-gray-700">Patients under cognitive monitoring</p>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 border-2 border-gray-400 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 border-2 border-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Filter:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="border-2 border-gray-400 px-4 py-2.5"
              >
                <option>All</option>
                <option>High Risk</option>
                <option>Moderate Risk</option>
                <option>Low Risk</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Patient Table */}
        <div className="bg-white border-2 border-gray-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-400">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Patient</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Patient ID</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Age</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Last Visit</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Risk Level</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">Trend</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 border-r-2 border-gray-300">MLU Score</th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="py-4 px-6 border-r border-gray-300">
                      <div className="flex items-center gap-3">
                        {patient.flagged && (
                          <span className="font-bold text-gray-900">!</span>
                        )}
                        <span className="font-medium text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 border-r border-gray-300">{patient.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">{patient.age}</td>
                    <td className="py-4 px-6 text-sm text-gray-900 border-r border-gray-300">
                      {new Date(patient.lastVisit).toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-300">
                      <span className="inline-block px-3 py-1 border border-gray-900 text-xs font-bold bg-gray-100">
                        {patient.risk}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-300">
                      {patient.trend === "down" && <span>↓</span>}
                      {patient.trend === "up" && <span>↑</span>}
                      {patient.trend === "stable" && <span>—</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-bold border-r border-gray-300">{patient.mlu}</td>
                    <td className="py-4 px-6">
                      <Link 
                        to={`/patient/${patient.id}`}
                        className="text-gray-900 underline font-bold text-sm"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            No patients found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
