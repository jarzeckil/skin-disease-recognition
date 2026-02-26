import { Github } from 'lucide-react';
import type { ModelMetrics } from '../types/api';

interface MetricsDisplayProps {
  metrics?: ModelMetrics;
  modelName?: string;
  modelVersion?: string;
  isLoading?: boolean;
}

// Mock data for UI development
const MOCK_METRICS: ModelMetrics = {
  f1: 0.92,
  accuracy: 0.954,
  recall: 0.91,
  precision: 0.93,
};

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics = MOCK_METRICS,
  modelName = 'EFFICIENTNET-B0',
  modelVersion = 'v1.0.0',
  isLoading = false,
}) => {
  const formatMetric = (value: number, isPercentage = false): string => {
    if (isPercentage) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
  };

  const metricItems = [
    { label: 'F1 Score', value: formatMetric(metrics.f1) },
    { label: 'Accuracy', value: formatMetric(metrics.accuracy, true) },
    { label: 'Recall', value: formatMetric(metrics.recall) },
    { label: 'Precision', value: formatMetric(metrics.precision) },
  ];

  return (
    <footer className="mt-auto border-t theme-border theme-bg-secondary py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-6">
          {/* Metrics row */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            {/* Metrics */}
            <div className="flex gap-8">
              {metricItems.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider theme-text-muted font-bold">
                    {item.label}
                  </span>
                  {isLoading ? (
                    <div className="h-5 w-12 theme-surface rounded animate-pulse mt-1" />
                  ) : (
                    <span className="text-sm font-semibold theme-text">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Model info and links */}
            <div className="flex items-center gap-6">
              <div className="text-xs theme-text-muted flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span>
                  {isLoading ? (
                    <span className="inline-block h-4 w-32 theme-surface rounded animate-pulse" />
                  ) : (
                    <>Model: {modelName} ({modelVersion})</>
                  )}
                </span>
              </div>
              <a
                href="https://github.com/jarzeckil/skin-disease-recognition"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium theme-text-muted hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                Source on GitHub
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t theme-border pt-4">
            <p className="text-[11px] theme-text-muted text-center leading-relaxed max-w-2xl mx-auto">
              <span className="font-bold text-primary/60">Disclaimer:</span>{' '}
              This tool is for research and educational purposes only and does not constitute medical advice. 
              Consult a healthcare professional for diagnosis.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MetricsDisplay;
