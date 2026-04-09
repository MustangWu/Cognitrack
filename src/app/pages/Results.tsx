import { Navigation } from "../components/Navigation";

export function Results() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analysis Results
          </h1>
          <p className="text-gray-700">
            Patient: Margaret Thompson
          </p>
          <p className="text-gray-700">
            Recording Date: March 15, 2026
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Transcript */}
          <div className="bg-white border-2 border-gray-400 p-6 h-[700px]">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Transcript (Doctor / Patient speech separated)
            </h2>
            <div className="w-full h-[600px] bg-gray-200 border-2 border-gray-400"></div>
          </div>
          
          {/* Right Panel - Biomarker Scores */}
          <div className="space-y-6">
            {/* MLU Score */}
            <div className="bg-white border-2 border-gray-400 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                MLU Score
              </h3>
              <div className="w-full h-3 bg-gray-300 border-2 border-gray-400"></div>
            </div>
            
            {/* Pause Ratio */}
            <div className="bg-white border-2 border-gray-400 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Pause Ratio
              </h3>
              <div className="w-full h-3 bg-gray-300 border-2 border-gray-400"></div>
            </div>
            
            {/* Type-Token Ratio */}
            <div className="bg-white border-2 border-gray-400 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Type-Token Ratio
              </h3>
              <div className="w-full h-3 bg-gray-300 border-2 border-gray-400"></div>
            </div>
            
            {/* Filler Word Count */}
            <div className="bg-white border-2 border-gray-400 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Filler Word Count
              </h3>
              <div className="w-full h-3 bg-gray-300 border-2 border-gray-400"></div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Risk Badge and Export Button */}
        <div className="flex items-center justify-between">
          <div className="inline-block border-2 border-gray-900 px-6 py-3 font-bold text-lg bg-gray-200">
            Overall Risk Badge
          </div>
          <button className="bg-gray-800 text-white px-6 py-3 border-2 border-gray-900 font-bold">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
