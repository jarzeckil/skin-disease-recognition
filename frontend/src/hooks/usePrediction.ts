/**
 * Custom hook for skin disease prediction
 * Manages API call state: idle -> loading -> success/error
 */

import { useState, useCallback } from 'react';
import { predictSkinDisease } from '../services/api';
import type { PredictionResponse, RequestStatus } from '../types/api';

interface UsePredictionReturn {
  status: RequestStatus;
  data: PredictionResponse | null;
  error: Error | null;
  predict: (file: File) => Promise<void>;
  reset: () => void;
}

export const usePrediction = (): UsePredictionReturn => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const predict = useCallback(async (file: File) => {
    setStatus('loading');
    setData(null);
    setError(null);

    try {
      const result = await predictSkinDisease(file);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Prediction failed'));
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return { status, data, error, predict, reset };
};
