/**
 * Sidebar - View Controls for Model Performance
 * Contains search filter and sort dropdown
 * Based on model_details Stitch reference
 */

import { Search, ChevronDown } from 'lucide-react';

export type SortMetric = 'f1-desc' | 'f1-asc' | 'precision-desc' | 'precision-asc' | 'recall-desc' | 'recall-asc' | 'alphabetical' | 'support-desc';

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMetric: SortMetric;
  onSortChange: (metric: SortMetric) => void;
}

const SORT_OPTIONS: { value: SortMetric; label: string }[] = [
  { value: 'f1-desc', label: 'F1-Score (High to Low)' },
  { value: 'f1-asc', label: 'F1-Score (Low to High)' },
  { value: 'precision-desc', label: 'Precision (High to Low)' },
  { value: 'precision-asc', label: 'Precision (Low to High)' },
  { value: 'recall-desc', label: 'Recall (High to Low)' },
  { value: 'recall-asc', label: 'Recall (Low to High)' },
  { value: 'support-desc', label: 'Support (High to Low)' },
  { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
];

const Sidebar: React.FC<SidebarProps> = ({
  searchQuery,
  onSearchChange,
  sortMetric,
  onSortChange,
}) => {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col gap-8 theme-border border-r p-6 overflow-y-auto hidden lg:flex">
      {/* View Controls Section */}
      <div className="flex flex-col gap-6 pt-2">
        <p className="text-xs font-bold uppercase tracking-wider theme-text-muted">
          View Controls
        </p>

        {/* Filter Conditions - Search Input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="condition-search"
            className="text-xs font-medium theme-text-muted"
          >
            Filter Conditions
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              id="condition-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full theme-surface-secondary border-none rounded-full py-2.5 pl-10 pr-4 text-sm theme-text placeholder:theme-text-muted focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Sort Metric - Dropdown */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sort-metric"
            className="text-xs font-medium theme-text-muted"
          >
            Sort Metric
          </label>
          <div className="relative">
            <select
              id="sort-metric"
              value={sortMetric}
              onChange={(e) => onSortChange(e.target.value as SortMetric)}
              className="w-full appearance-none theme-surface-secondary border-none rounded-full py-2.5 pl-4 pr-10 text-sm theme-text focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
