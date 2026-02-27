/**
 * Export Report Utility
 * Generates and downloads a JSON report with prediction results and model metrics
 */

import type { PredictionResponse, ModelInfoResponse } from '../types/api';

interface ExportReportData {
  predictions: PredictionResponse;
  modelInfo: ModelInfoResponse | null;
  fileName: string;
}

interface DiagnosisReport {
  reportMetadata: {
    generatedAt: string;
    applicationName: string;
    applicationVersion: string;
  };
  imageInfo: {
    fileName: string;
  };
  analysisResults: {
    predictions: Array<{
      condition: string;
      probability: number;
      probabilityPercent: string;
    }>;
    primaryDiagnosis: {
      condition: string;
      confidence: number;
      confidencePercent: string;
    };
  };
  modelInfo: {
    name: string;
    version: string;
  } | null;
  disclaimer: string;
}

/**
 * Generates a structured report object from prediction and model data
 */
const generateReport = (data: ExportReportData): DiagnosisReport => {
  const { predictions, modelInfo, fileName } = data;

  // Sort predictions by probability
  const sortedPredictions = Object.entries(predictions.predictions)
    .map(([condition, probability]) => ({
      condition: condition.replace(/_/g, ' '),
      probability,
      probabilityPercent: `${(probability * 100).toFixed(2)}%`,
    }))
    .sort((a, b) => b.probability - a.probability);

  const primaryDiagnosis = sortedPredictions[0];

  return {
    reportMetadata: {
      generatedAt: new Date().toISOString(),
      applicationName: 'DermAI Assist',
      applicationVersion: '1.0.0',
    },
    imageInfo: {
      fileName,
    },
    analysisResults: {
      predictions: sortedPredictions,
      primaryDiagnosis: {
        condition: primaryDiagnosis.condition,
        confidence: primaryDiagnosis.probability,
        confidencePercent: primaryDiagnosis.probabilityPercent,
      },
    },
    modelInfo: modelInfo
      ? {
          name: modelInfo.model_name,
          version: modelInfo.model_version,
        }
      : null,
    disclaimer:
      'This report is generated for research and educational purposes only. It does not constitute medical advice. Please consult a qualified healthcare professional for diagnosis and treatment.',
  };
};

/**
 * Downloads the report as a JSON file
 */
export const exportReport = (data: ExportReportData): void => {
  const report = generateReport(data);

  // Create JSON blob
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseFileName = data.fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  link.download = `dermai-report_${baseFileName}_${timestamp}.json`;
  
  link.href = url;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
