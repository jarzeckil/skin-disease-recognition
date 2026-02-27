/**
 * Custom hook for fetching classification report
 * Fetches per-class metrics on mount and provides refresh capability
 */

import { useState, useEffect, useCallback } from 'react';
import { getClassificationReport } from '../services/api';
import type { ClassificationReportResponse, RequestStatus } from '../types/api';

interface UseClassificationReportReturn {
  status: RequestStatus;
  data: ClassificationReportResponse | null;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useClassificationReport = (): UseClassificationReportReturn => {
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [data, setData] = useState<ClassificationReportResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await getClassificationReport();
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch classification report'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { status, data, error, refresh: fetchReport };
};
