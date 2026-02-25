/**
 * Custom hook for fetching model info and metrics
 * Fetches data on mount and provides refresh capability
 */

import { useState, useEffect, useCallback } from 'react';
import { getModelInfo } from '../services/api';
import type { ModelInfoResponse, RequestStatus } from '../types/api';

interface UseModelInfoReturn {
  status: RequestStatus;
  data: ModelInfoResponse | null;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useModelInfo = (): UseModelInfoReturn => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [data, setData] = useState<ModelInfoResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchModelInfo = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await getModelInfo();
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch model info'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchModelInfo();
  }, [fetchModelInfo]);

  return { status, data, error, refresh: fetchModelInfo };
};
