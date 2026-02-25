/**
 * AnalysisScreen - Shows image preview and prediction results
 * Based on dark_mode_refined_analysis_1 reference
 */

import { Play, Camera, CheckCircle, BarChart3, Loader2 } from 'lucide-react';
import type { PredictionResponse, RequestStatus } from '../types/api';

interface AnalysisScreenProps {
  imageUrl: string;
  onRunDiagnosis: () => void;
  onChangePhoto: () => void;
  predictionStatus: RequestStatus;
  predictionData: PredictionResponse | null;
  predictionError: Error | null;
}

// Helper to get top N predictions sorted by probability
const getTopPredictions = (predictions: Record<string, number>, count: number = 5) => {
  return Object.entries(predictions)
    .map(([name, probability]) => ({ name: name.replace(/_/g, ' '), probability }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, count);
};

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  imageUrl,
  onRunDiagnosis,
  onChangePhoto,
  predictionStatus,
  predictionData,
  predictionError,
}) => {
  const isLoading = predictionStatus === 'loading';
  const hasResults = predictionStatus === 'success' && predictionData;
  const hasError = predictionStatus === 'error';

  const topPredictions = hasResults 
    ? getTopPredictions(predictionData.predictions, 5) 
    : [];
  const primaryPrediction = topPredictions[0];

  const handleChangeClick = () => {
    onChangePhoto();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column - Image Preview */}
      <div className="lg:col-span-7 flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-4 flex-1">
          {/* Image Container */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg theme-border border group">
            <img
              src={imageUrl}
              alt="Uploaded skin lesion for analysis"
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Image Ready
                </>
              )}
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <p className="text-white font-medium">Running AI Analysis...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center pt-2">
            <button
              onClick={onRunDiagnosis}
              disabled={isLoading}
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary/90 hover:bg-primary text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" fill="currentColor" />
                  Run Diagnosis
                </>
              )}
            </button>
            <button
              onClick={handleChangeClick}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 theme-surface theme-border border theme-text-secondary rounded-full font-semibold text-sm theme-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />
              Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-5 space-y-6">
        {/* Primary Prediction Card */}
        {hasResults ? (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 md:text-left text-center">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
                Primary Prediction
              </p>
              <h3 className="text-2xl font-black mb-1 theme-text">
                {primaryPrediction.name}
              </h3>
              <div className="flex items-center md:justify-start justify-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  {(primaryPrediction.probability * 100).toFixed(1)}%
                </span>
                <span className="theme-text-muted text-sm font-medium">Confidence</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="theme-surface theme-border border rounded-xl p-6 flex flex-col justify-center items-center min-h-[160px] text-center gap-3">
            <div className={`w-12 h-12 rounded-full theme-bg-secondary flex items-center justify-center ${isLoading ? 'animate-pulse' : ''}`}>
              <BarChart3 className="w-6 h-6 theme-text-muted" />
            </div>
            <div>
              <h3 className="text-lg font-bold theme-text-secondary">
                {isLoading ? 'Analyzing...' : 'Analysis Pending'}
              </h3>
              <p className="text-sm theme-text-muted">
                {isLoading ? 'Please wait while AI processes your image' : 'Run diagnosis to see primary prediction'}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {hasError && predictionError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-sm">Analysis Failed</p>
            <p className="text-red-300/80 text-sm mt-1">{predictionError.message}</p>
          </div>
        )}

        {/* Differential Diagnosis Card */}
        <div className={`theme-surface theme-border border rounded-xl p-6 shadow-sm ${!hasResults ? 'opacity-60 pointer-events-none select-none' : ''}`}>
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg theme-text">Differential Diagnosis</h4>
            <span className="text-xs theme-bg-secondary px-2 py-1 rounded-md theme-text-muted">
              Top 5 Probabilities
            </span>
          </div>
          <div className="space-y-5">
            {hasResults ? (
              topPredictions.map((prediction, index) => (
                <div key={prediction.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={`font-semibold ${index === 0 ? 'theme-text' : 'theme-text-muted'}`}>
                      {prediction.name}
                    </span>
                    <span className={`font-bold ${index === 0 ? 'text-primary' : 'theme-text-muted'}`}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className={`w-full ${index === 0 ? 'h-2.5' : 'h-2'} theme-bg-secondary rounded-full overflow-hidden`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-primary' : 'theme-text-muted'}`}
                      style={{ 
                        width: `${Math.max(prediction.probability * 100, 0.5)}%`,
                        backgroundColor: index === 0 ? undefined : 'var(--theme-text-muted)'
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              // Placeholder bars
              [...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold theme-text-muted">Waiting for data...</span>
                    <span className="theme-text-muted font-bold">--%</span>
                  </div>
                  <div className="w-full h-2 theme-bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: 'var(--theme-text-muted)' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;
