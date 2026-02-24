import { Activity } from 'lucide-react';

interface PredictionItem {
  name: string;
  probability: number;
  isTop?: boolean;
}

interface PredictionChartProps {
  predictions?: PredictionItem[];
  isLoading?: boolean;
}

// Mock data for UI development
const MOCK_PREDICTIONS: PredictionItem[] = [
  { name: 'Melanoma', probability: 0.942, isTop: true },
  { name: 'Basal Cell Carcinoma', probability: 0.031 },
  { name: 'Seborrheic Keratosis', probability: 0.014 },
  { name: 'Nevus', probability: 0.008 },
  { name: 'Actinic Keratosis', probability: 0.005 },
];

const PredictionChart: React.FC<PredictionChartProps> = ({ 
  predictions = MOCK_PREDICTIONS,
  isLoading = false 
}) => {
  const topPrediction = predictions.find(p => p.isTop) || predictions[0];
  const otherPredictions = predictions.filter(p => p !== topPrediction);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Primary prediction skeleton */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-4 w-32 bg-slate-700 rounded mb-3" />
          <div className="h-8 w-40 bg-slate-700 rounded mb-2" />
          <div className="h-10 w-24 bg-slate-700 rounded" />
        </div>
        
        {/* Chart skeleton */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="h-6 w-48 bg-slate-700 rounded mb-6" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
              <div className="h-2 w-full bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary prediction card */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
              Primary Prediction
            </p>
            <h3 className="text-2xl font-black text-slate-100 mb-1">
              {topPrediction.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {(topPrediction.probability * 100).toFixed(1)}%
              </span>
              <span className="text-slate-500 text-sm font-medium">Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Differential diagnosis card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-lg text-slate-100">Differential Diagnosis</h4>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-md text-slate-400">
            Top {predictions.length} Probabilities
          </span>
        </div>

        <div className="space-y-5">
          {/* Top prediction bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-100">{topPrediction.name}</span>
              <span className="text-primary font-bold">
                {(topPrediction.probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${topPrediction.probability * 100}%` }}
              />
            </div>
          </div>

          {/* Other predictions */}
          {otherPredictions.map((prediction) => (
            <div key={prediction.name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-400">{prediction.name}</span>
                <span className="text-slate-400 font-bold">
                  {(prediction.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(prediction.probability * 100, 0.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
