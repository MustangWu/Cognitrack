import { Navigation } from "../components/Navigation";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Upload() {
  const [patientId, setPatientId] = useState("");
  const [recordingDate, setRecordingDate] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a)$/i)) {
        setFileName(file.name);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/results');
  };

  const isFormValid = patientId && recordingDate && fileName && consentChecked;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Patient Recording
            </h1>
            <p className="text-gray-700">
              Upload a consultation audio file for speech biomarker analysis
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-400 p-8">
            {/* Patient ID + Recording Date Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g., PT-2024-001"
                  className="w-full border-2 border-gray-400 px-4 py-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Recording Date *
                </label>
                <input
                  type="date"
                  value={recordingDate}
                  onChange={(e) => setRecordingDate(e.target.value)}
                  className="w-full border-2 border-gray-400 px-4 py-3"
                />
              </div>
            </div>
            
            {/* Audio Upload Zone */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Audio File *
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-4 ${
                  isDragging 
                    ? 'border-gray-900 bg-gray-200' 
                    : fileName
                    ? 'border-gray-600 bg-gray-100'
                    : 'border-dashed border-gray-400 bg-gray-50'
                } p-16 text-center`}
              >
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  {fileName ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-400 border-2 border-gray-500 mb-4"></div>
                      <p className="text-lg font-bold text-gray-900 mb-1">{fileName}</p>
                      <p className="text-sm text-gray-700">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 mb-4"></div>
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        Drag and drop your audio file here
                      </p>
                      <p className="text-sm text-gray-700 mb-4">or click to browse files</p>
                      <p className="text-xs text-gray-600">
                        Supported formats: MP3, WAV, M4A (max 100MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            {/* Consent Checkbox */}
            <div className="mb-8 bg-gray-100 border-2 border-gray-300 p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="w-5 h-5 mt-0.5 border-2 border-gray-400"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-900">
                    I confirm that informed consent has been obtained from the patient for this recording 
                    to be used for clinical assessment purposes. *
                  </span>
                  <p className="text-xs text-gray-700 mt-1">
                    This recording will be processed in accordance with Australian privacy legislation and RACGP guidelines.
                  </p>
                </div>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 font-bold text-lg border-2 bg-gray-800 text-white border-gray-900"
            >
              Upload & Analyse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}