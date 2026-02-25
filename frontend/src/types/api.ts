/**
 * API Types based on contracts defined in agents.md
 */

// POST /predict response
export interface PredictionResponse {
  predictions: Record<string, number>;
}

// GET /info response
export interface ModelMetrics {
  f1: number;
  accuracy: number;
  recall: number;
  precision: number;
}

export interface ModelInfoResponse {
  model_name: string;
  metrics: ModelMetrics;
}

// Request status for API calls
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Generic API state wrapper
export interface ApiState<T> {
  status: RequestStatus;
  data: T | null;
  error: Error | null;
}
