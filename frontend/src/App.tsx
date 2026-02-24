import { useState } from 'react';
import { FileCheck, Share } from 'lucide-react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PredictionChart from './components/PredictionChart';
import MetricsDisplay from './components/MetricsDisplay';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Show mock results for UI development - will be replaced with actual API state
  const showResults = true;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // TODO: Call prediction API here when wiring is complete
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Skin Lesion Analysis
            </h1>
            <p className="text-slate-400 mt-2">
              AI-powered dermatological diagnostic support
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              disabled={!selectedFile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share className="w-4 h-4" />
              Export Report
            </button>
            <button
              disabled={!selectedFile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileCheck className="w-4 h-4" />
              Verify Diagnosis
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Image Uploader */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <ImageUploader
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />
          </div>

          {/* Right column - Prediction Results */}
          <div className="lg:col-span-5 space-y-6">
            {showResults ? (
              <PredictionChart />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30">
                <div className="text-center p-8">
                  <p className="text-slate-400 text-lg font-medium">
                    Upload an image to see predictions
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Results will appear here after analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <MetricsDisplay />
    </div>
  );
};

export default App;
