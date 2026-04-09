import { Navigation } from "../components/Navigation";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistics Dashboard
          </h1>
          <p className="text-gray-700">
            Australian dementia prevalence and neurological disease burden data
          </p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border-2 border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400"></div>
              <span className="text-sm font-medium text-gray-700">+5.4%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">425,000</div>
            <p className="text-sm text-gray-700">Current Prevalence</p>
            <p className="text-xs text-gray-600 mt-1">Australians living with dementia (2024)</p>
          </div>
          
          <div className="bg-white p-6 border-2 border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400"></div>
              <span className="text-sm font-medium text-gray-700">+8.2%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">21,000</div>
            <p className="text-sm text-gray-700">Annual Mortality</p>
            <p className="text-xs text-gray-600 mt-1">Dementia-related deaths (2022)</p>
          </div>
          
          <div className="bg-white p-6 border-2 border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400"></div>
              <span className="text-sm font-medium text-gray-700">+159%</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">1.1M</div>
            <p className="text-sm text-gray-700">2058 Projection</p>
            <p className="text-xs text-gray-600 mt-1">Expected cases by 2058</p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 gap-8">
          {/* Prevalence Over Time */}
          <div className="bg-white p-8 border-2 border-gray-400">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Dementia Prevalence Over Time
            </h2>
            <p className="text-sm text-gray-700 mb-6">Number of Australians living with dementia (in thousands)</p>
            <div className="w-full h-[350px] bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <p className="text-gray-700 font-medium">Chart: Dementia Prevalence Over Time</p>
            </div>
          </div>
          
          {/* Top Neurological Conditions */}
          <div className="bg-white p-8 border-2 border-gray-400">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Top Neurological Conditions by Disease Burden
            </h2>
            <p className="text-sm text-gray-700 mb-6">Disability-Adjusted Life Years (DALYs) in thousands</p>
            <div className="w-full h-[350px] bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
              <p className="text-gray-700 font-medium">Chart: Top Neurological Conditions by Burden</p>
            </div>
          </div>
        </div>
        
        {/* AIHW Attribution */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Data source: Australian Institute of Health and Welfare (AIHW) — Dementia in Australia, 2022
          </p>
        </div>
      </div>
    </div>
  );
}
