/**
 * ClassificationReport - Model Performance Heatmap Dashboard
 * Based on model_details Stitch reference
 */

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { SortMetric } from './Sidebar';

// Types for classification metrics
interface ClassMetrics {
  condition: string;
  category: 'Malignant' | 'Pre-malignant' | 'Benign';
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

interface OverallMetrics {
  accuracy: number;
  macroF1: number;
  totalSupport: number;
  modelVersion: string;
}

interface ClassificationReportProps {
  classMetrics?: ClassMetrics[];
  overallMetrics?: OverallMetrics;
  searchQuery?: string;
  sortMetric?: SortMetric;
}

// Mock data for 22 skin conditions
const MOCK_CLASS_METRICS: ClassMetrics[] = [
  { condition: 'Melanoma', category: 'Malignant', precision: 0.92, recall: 0.88, f1Score: 0.90, support: 1240 },
  { condition: 'Basal Cell Carcinoma', category: 'Malignant', precision: 0.95, recall: 0.94, f1Score: 0.94, support: 3100 },
  { condition: 'Squamous Cell Carcinoma', category: 'Malignant', precision: 0.89, recall: 0.85, f1Score: 0.87, support: 980 },
  { condition: 'Actinic Keratosis', category: 'Pre-malignant', precision: 0.82, recall: 0.79, f1Score: 0.80, support: 540 },
  { condition: 'Seborrheic Keratosis', category: 'Benign', precision: 0.91, recall: 0.93, f1Score: 0.92, support: 1150 },
  { condition: 'Dermatofibroma', category: 'Benign', precision: 0.76, recall: 0.72, f1Score: 0.74, support: 210 },
  { condition: 'Vascular Lesion', category: 'Benign', precision: 0.88, recall: 0.90, f1Score: 0.89, support: 320 },
  { condition: 'Nevus', category: 'Benign', precision: 0.96, recall: 0.97, f1Score: 0.96, support: 5600 },
  { condition: 'Pigmented Benign Keratosis', category: 'Benign', precision: 0.84, recall: 0.81, f1Score: 0.82, support: 890 },
  { condition: 'Solar Lentigo', category: 'Benign', precision: 0.87, recall: 0.85, f1Score: 0.86, support: 420 },
  { condition: 'Lentigo Maligna', category: 'Pre-malignant', precision: 0.78, recall: 0.74, f1Score: 0.76, support: 180 },
  { condition: 'Atypical Melanocytic Proliferation', category: 'Pre-malignant', precision: 0.71, recall: 0.68, f1Score: 0.69, support: 95 },
  { condition: "Bowen's Disease", category: 'Pre-malignant', precision: 0.83, recall: 0.80, f1Score: 0.81, support: 230 },
  { condition: 'Kaposi Sarcoma', category: 'Malignant', precision: 0.90, recall: 0.87, f1Score: 0.88, support: 145 },
  { condition: 'Merkel Cell Carcinoma', category: 'Malignant', precision: 0.86, recall: 0.82, f1Score: 0.84, support: 78 },
  { condition: 'Dermatitis', category: 'Benign', precision: 0.79, recall: 0.76, f1Score: 0.77, support: 560 },
  { condition: 'Psoriasis', category: 'Benign', precision: 0.85, recall: 0.88, f1Score: 0.86, support: 480 },
  { condition: 'Eczema', category: 'Benign', precision: 0.81, recall: 0.78, f1Score: 0.79, support: 620 },
  { condition: 'Rosacea', category: 'Benign', precision: 0.88, recall: 0.91, f1Score: 0.89, support: 340 },
  { condition: 'Vitiligo', category: 'Benign', precision: 0.94, recall: 0.96, f1Score: 0.95, support: 275 },
  { condition: 'Tinea', category: 'Benign', precision: 0.82, recall: 0.79, f1Score: 0.80, support: 390 },
  { condition: 'Warts', category: 'Benign', precision: 0.89, recall: 0.92, f1Score: 0.90, support: 510 },
];

const MOCK_OVERALL_METRICS: OverallMetrics = {
  accuracy: 0.948,
  macroF1: 0.92,
  totalSupport: 12840,
  modelVersion: 'v2.4.1',
};

/**
 * Get color classes based on metric value (heatmap coloring)
 */
const getMetricColorClasses = (value: number): string => {
  if (value >= 0.90) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (value >= 0.80) {
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  } else if (value >= 0.70) {
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
  return value.toLocaleString();
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
      filtered = metrics.filter(
        (item) =>
          item.condition.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
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
  classMetrics = MOCK_CLASS_METRICS,
  overallMetrics = MOCK_OVERALL_METRICS,
  searchQuery = '',
  sortMetric = 'f1-desc',
}) => {
  const displayedMetrics = useFilteredAndSortedMetrics(
    classMetrics,
    searchQuery,
    sortMetric
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Accuracy */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            Overall Accuracy
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatMetric(overallMetrics.accuracy, true)}
            </span>
            <span className="text-emerald-500 text-sm font-medium mb-1 flex items-center">
              <TrendingUp className="w-4 h-4" /> +2.4%
            </span>
          </div>
        </div>

        {/* Macro Avg F1 */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            Macro Avg F1
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatMetric(overallMetrics.macroF1)}
            </span>
            <span className="text-emerald-500 text-sm font-medium mb-1 flex items-center">
              <TrendingUp className="w-4 h-4" /> +0.05
            </span>
          </div>
        </div>

        {/* Total Support */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            Total Support
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {formatSupport(overallMetrics.totalSupport)}
            </span>
            <span className="theme-text-muted text-sm font-medium mb-1">samples</span>
          </div>
        </div>

        {/* Model Version */}
        <div className="theme-surface theme-border border p-5 rounded-2xl shadow-sm flex flex-col gap-2">
          <span className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            Model Version
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold theme-text">
              {overallMetrics.modelVersion}
            </span>
            <span className="theme-text-muted text-sm font-medium mb-1 theme-bg-secondary px-2 py-0.5 rounded text-[10px]">
              STABLE
            </span>
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
                  Precision
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-center">
                  Recall
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-center">
                  F1-Score
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider theme-text-muted w-1/6 text-right">
                  Support
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
              ) : displayedMetrics.map((item) => (
                <tr
                  key={item.condition}
                  className="group hover:bg-slate-800/30 transition-colors"
                >
                  {/* Condition Name */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold theme-text">{item.condition}</span>
                      <span className="text-xs theme-text-muted">{item.category}</span>
                    </div>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs theme-text-muted">
        <span className="font-semibold">Metric Scale:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
          <span>Excellent (90%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />
          <span>Good (80-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
          <span>Fair (70-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
          <span>Poor (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};

export default ClassificationReport;
