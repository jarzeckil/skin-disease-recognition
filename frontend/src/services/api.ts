/**
 * API Service Layer
 * Uses relative paths - Vite proxy handles routing to backend
 * Based on contracts defined in agents.md
 */

import type { PredictionResponse, ModelInfoResponse } from '../types/api';

/**
 * Send image for skin disease prediction
 * @param file - Image file to analyze
 * @returns Prediction results with disease probabilities
 */
export const predictSkinDisease = async (file: File): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/predict', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Prediction failed (${response.status}): ${errorText}`);
  }

  return response.json();
};

/**
 * Get model information and metrics
 * @returns Model name and performance metrics
 */
export const getModelInfo = async (): Promise<ModelInfoResponse> => {
  const response = await fetch('/api/info', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch model info (${response.status}): ${errorText}`);
  }

  return response.json();
};
