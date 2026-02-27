/**
 * API Types based on contracts defined in agents.md
 */

// POST /predict response
export interface PredictionResponse {
  predictions: Record<string, number>;
}

// GET /info response
export interface ModelInfoResponse {
  model_name: string;
  model_version: string;
}

// GET /report response
export interface ClassMetricsData {
  precision: number;
  recall: number;
  'f1-score': number;
  support: number;
}

export interface ClassificationReportResponse {
  [className: string]: ClassMetricsData;
}

// Request status for API calls
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Generic API state wrapper
export interface ApiState<T> {
  status: RequestStatus;
  data: T | null;
  error: Error | null;
}
