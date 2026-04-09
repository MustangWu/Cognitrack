import { Navigation } from "../components/Navigation";
import { Link } from "react-router";

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Hero Section */}
        <div className="py-20 text-center border-b-2 border-gray-300">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
            AI-Powered Speech Biomarkers for Early Dementia Detection
          </h1>
          <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto">
            Empower your clinical practice with cutting-edge speech analysis technology. 
            Detect cognitive decline earlier, make confident referrals, and improve patient outcomes.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/upload"
              className="inline-block bg-gray-800 text-white px-8 py-4 border-2 border-gray-900 font-medium"
            >
              Upload Recording
            </Link>
            <Link 
              to="/dashboard"
              className="inline-block bg-white text-gray-900 border-2 border-gray-900 px-8 py-4 font-medium"
            >
              View Dashboard
            </Link>
          </div>
        </div>
        
        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-b-2 border-gray-300">
          <div className="border-2 border-gray-400 p-8">
            <div className="w-14 h-14 bg-gray-300 border-2 border-gray-400 mb-4"></div>
            <div className="text-3xl font-bold text-gray-900 mb-2">425,000</div>
            <p className="text-gray-900 font-medium mb-1">Australians with Dementia</p>
            <p className="text-sm text-gray-600">Projected to reach 1.1M by 2065</p>
          </div>
          
          <div className="border-2 border-gray-400 p-8">
            <div className="w-14 h-14 bg-gray-300 border-2 border-gray-400 mb-4"></div>
            <div className="text-3xl font-bold text-gray-900 mb-2">3–5 Years</div>
            <p className="text-gray-900 font-medium mb-1">Average Diagnosis Delay</p>
            <p className="text-sm text-gray-600">Time lost for early intervention</p>
          </div>
          
          <div className="border-2 border-gray-400 p-8">
            <div className="w-14 h-14 bg-gray-300 border-2 border-gray-400 mb-4"></div>
            <div className="text-3xl font-bold text-gray-900 mb-2">1 in 5</div>
            <p className="text-gray-900 font-medium mb-1">MCI Cases Detected by MMSE</p>
            <p className="text-sm text-gray-600">Most early-stage decline goes undetected</p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 border-2 border-gray-500 mx-auto mb-4"></div>
              <div className="w-10 h-10 border-2 border-gray-900 text-gray-900 font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Recording</h3>
              <p className="text-sm text-gray-700">
                Upload a routine consultation audio file from your patient interaction
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 border-2 border-gray-500 mx-auto mb-4"></div>
              <div className="w-10 h-10 border-2 border-gray-900 text-gray-900 font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-700">
                Our AI extracts speech biomarkers like pause ratio, lexical diversity, and utterance length
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 border-2 border-gray-500 mx-auto mb-4"></div>
              <div className="w-10 h-10 border-2 border-gray-900 text-gray-900 font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Get Results</h3>
              <p className="text-sm text-gray-700">
                Receive detailed biomarker scores with clinical interpretations and risk assessment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 border-2 border-gray-500 mx-auto mb-4"></div>
              <div className="w-10 h-10 border-2 border-gray-900 text-gray-900 font-bold flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clinical Decision</h3>
              <p className="text-sm text-gray-700">
                Make informed referral decisions with confidence and track progress over time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}