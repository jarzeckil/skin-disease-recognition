/**
 * ClassificationReport - Model Performance Heatmap Dashboard
 * Connected to /api/report endpoint
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import type { SortMetric } from './Sidebar';
import { useClassificationReport } from '../hooks';
import type { ClassificationReportResponse } from '../types/api';

// Metric descriptions for tooltips
const METRIC_DESCRIPTIONS = {
  accuracy: 'Percentage of correctly classified samples out of all samples.',
  precision: 'Of all samples marked as positive, how many were actually positive.',
  recall: 'Of all actual positive samples, how many were detected.',
  f1Score: 'Harmonic mean of precision and recall. Balances both metrics into a single score.',
  support: 'Number of samples in the test set for each class.',
  macroF1: 'Average F1-score across all classes, treating each class equally regardless of size.',
  macroPrecision: 'Average precision across all classes, treating each class equally.',
} as const;

// InfoTooltip component
interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-600/50 hover:bg-slate-500/50 transition-colors cursor-help ml-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="More information"
      >
        <Info className="w-2.5 h-2.5 text-slate-300" />
      </button>
      {isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-xs font-normal normal-case tracking-normal text-white bg-slate-800 rounded-lg shadow-xl w-56 text-left border border-slate-700 pointer-events-none"
            style={{
              top: position.top,
              left: position.left,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px] border-4 border-transparent border-b-slate-800" />
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

// Types for classification metrics (display format)
interface ClassMetrics {
  condition: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

interface OverallMetrics {
  accuracy: number;
  macroF1: number;
  macroPrecision: number;
  macroRecall: number;
  totalSupport: number;
}

interface ClassificationReportProps {
  searchQuery?: string;
  sortMetric?: SortMetric;
}

// Reserved keys in API response that are not class metrics
const RESERVED_KEYS = ['accuracy', 'macro avg', 'weighted avg'];

/**
 * Transform API response to display format
 */
const transformApiData = (
  data: ClassificationReportResponse
): { classMetrics: ClassMetrics[]; overallMetrics: OverallMetrics } => {
  const classMetrics: ClassMetrics[] = [];

  // Extract class metrics (exclude reserved keys)
  for (const [key, value] of Object.entries(data)) {
    if (RESERVED_KEYS.includes(key)) continue;
    
    classMetrics.push({
      condition: key.replace(/_/g, ' '),
      precision: value.precision,
      recall: value.recall,
      f1Score: value['f1-score'],
      support: value.support,
    });
  }

  // Extract overall metrics
  const macroAvg = data['macro avg'];
  const accuracy = typeof data.accuracy === 'number' 
    ? data.accuracy 
    : (data.accuracy as unknown as { precision: number })?.precision ?? 0;

  const overallMetrics: OverallMetrics = {
    accuracy: accuracy,
    macroF1: macroAvg?.['f1-score'] ?? 0,
    macroPrecision: macroAvg?.precision ?? 0,
    macroRecall: macroAvg?.recall ?? 0,
    totalSupport: macroAvg?.support ?? 0,
  };

  return { classMetrics, overallMetrics };
};

/**
 * Get color classes based on metric value (heatmap coloring)
 */
const getMetricColorClasses = (value: number): string => {
  if (value >= 0.85) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (value >= 0.75) {
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  } else if (value >= 0.65) {
    return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  } else {
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  }
};

/**
 * Format metric value for display
 */
const formatMetric = (value: number, asPercent: boolean = false): string => {
  if (asPercent) {
    return `${Math.round(value * 100)}%`;
  }
  return value.toFixed(2);
};

/**
 * Format support number with commas
 */
const formatSupport = (value: number): string => {
  return Math.round(value).toLocaleString();
};

/**
 * Filter and sort class metrics based on search query and sort metric
 */
const useFilteredAndSortedMetrics = (
  metrics: ClassMetrics[],
  searchQuery: string,
  sortMetric: SortMetric
): ClassMetrics[] => {
  return useMemo(() => {
    // Filter by search query
    let filtered = metrics;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = metrics.filter((item) =>
        item.condition.toLowerCase().includes(query)
      );
    }

    // Sort by selected metric
    const sorted = [...filtered].sort((a, b) => {
      switch (sortMetric) {
        case 'f1-desc':
          return b.f1Score - a.f1Score;
        case 'f1-asc':
          return a.f1Score - b.f1Score;
        case 'precision-desc':
          return b.precision - a.precision;
        case 'precision-asc':
          return a.precision - b.precision;
        case 'recall-desc':
          return b.recall - a.recall;
        case 'recall-asc':
          return a.recall - b.recall;
        case 'support-desc':
          return b.support - a.support;
        case 'alphabetical':
          return a.condition.localeCompare(b.condition);
        default:
          return 0;
      }
    });

    return sorted;
  }, [metrics, searchQuery, sortMetric]);
};

const ClassificationReport: React.FC<ClassificationReportProps> = ({
  searchQuery = '',
  sortMetric = 'f1-desc',
}) => {
  const { status, data, error, refresh } = useClassificationReport();

  // Transform API data to display format
  const { classMetrics, overallMetrics } = useMemo(() => {
    if (!data) {
      return { classMetrics: [], overallMetrics: null };
    }
    return transformApiData(data);
  }, [data]);

  const displayedMetrics = useFilteredAndSortedMetrics(
    classMetrics,
    searchQuery,
    sortMetric
  );

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="theme-text-muted text-sm">Loading classification report...</p>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="theme-text font-semibold">Failed to load report</p>
        <p className="theme-text-muted text-sm">{error?.message}</p>
        <button
          onClick={refresh}
          className="mt-2 px-6 py-2 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data state
  if (!overallMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="theme-text-muted text-sm">No classification data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Accuracy */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider flex items-center">
            Overall Accuracy
            <InfoTooltip text={METRIC_DESCRIPTIONS.accuracy} />
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatMetric(overallMetrics.accuracy, true)}
            </span>
          </div>
        </div>

        {/* Macro Avg F1 */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider flex items-center">
            Macro Avg F1
            <InfoTooltip text={METRIC_DESCRIPTIONS.macroF1} />
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatMetric(overallMetrics.macroF1)}
            </span>
          </div>
        </div>

        {/* Macro Precision */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider flex items-center">
            Macro Precision
            <InfoTooltip text={METRIC_DESCRIPTIONS.macroPrecision} />
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatMetric(overallMetrics.macroPrecision)}
            </span>
          </div>
        </div>

        {/* Total Support */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider flex items-center">
            Total Support
            <InfoTooltip text={METRIC_DESCRIPTIONS.support} />
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatSupport(overallMetrics.totalSupport)}
            </span>
            <span className="theme-text-muted text-sm font-medium mb-1">samples</span>
          </div>
        </div>
      </div>

      {/* Classification Report Table */}
      <div className="theme-surface rounded-3xl theme-border border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="theme-bg-secondary border-b theme-border">
              <tr>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/4">
                  Condition
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-center">
                  <span className="inline-flex items-center justify-center">
                    Precision
                    <InfoTooltip text={METRIC_DESCRIPTIONS.precision} />
                  </span>
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-center">
                  <span className="inline-flex items-center justify-center">
                    Recall
                    <InfoTooltip text={METRIC_DESCRIPTIONS.recall} />
                  </span>
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-center">
                  <span className="inline-flex items-center justify-center">
                    F1-Score
                    <InfoTooltip text={METRIC_DESCRIPTIONS.f1Score} />
                  </span>
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-right">
                  <span className="inline-flex items-center justify-end">
                    Support
                    <InfoTooltip text={METRIC_DESCRIPTIONS.support} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border">
              {displayedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <p className="theme-text-muted text-sm">
                      No conditions found matching "{searchQuery}"
                    </p>
                  </td>
                </tr>
              ) : (
                displayedMetrics.map((item) => (
                  <tr
                    key={item.condition}
                    className="group hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Condition Name */}
                    <td className="py-4 px-6">
                      <span className="font-bold theme-text">{item.condition}</span>
                    </td>

                    {/* Precision */}
                    <td className="py-3 px-4">
                      <div className="h-full w-full flex items-center justify-center">
                        <div
                          className={`w-full max-w-[120px] rounded-lg px-3 py-1.5 text-center text-sm font-bold border ${getMetricColorClasses(item.precision)}`}
                        >
                          {formatMetric(item.precision, true)}
                        </div>
                      </div>
                    </td>

                    {/* Recall */}
                    <td className="py-3 px-4">
                      <div className="h-full w-full flex items-center justify-center">
                        <div
                          className={`w-full max-w-[120px] rounded-lg px-3 py-1.5 text-center text-sm font-bold border ${getMetricColorClasses(item.recall)}`}
                        >
                          {formatMetric(item.recall, true)}
                        </div>
                      </div>
                    </td>

                    {/* F1-Score */}
                    <td className="py-3 px-4">
                      <div className="h-full w-full flex items-center justify-center">
                        <div
                          className={`w-full max-w-[120px] rounded-lg px-3 py-1.5 text-center text-sm font-bold border ${getMetricColorClasses(item.f1Score)}`}
                        >
                          {formatMetric(item.f1Score)}
                        </div>
                      </div>
                    </td>

                    {/* Support */}
                    <td className="py-4 px-6 text-right text-sm theme-text-muted font-mono">
                      {formatSupport(item.support)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs theme-text-muted">
        <span className="font-semibold">Metric Scale:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span>Excellent (85%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span>Good (75-84%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
          <span>Fair (65-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
          <span>Poor (&lt;65%)</span>
        </div>
      </div>
    </div>
  );
};

export default ClassificationReport;
