/**
 * Main App Component
 * State-driven UI with two screens: Home and Analysis
 */

import { useState, useCallback, useEffect } from 'react';
import { Download } from 'lucide-react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import AnalysisScreen from './components/AnalysisScreen';
import MetricsDisplay from './components/MetricsDisplay';
import { usePrediction, useModelInfo, useTheme } from './hooks';
import { validateImageFile } from './utils/validation';
import { exportReport } from './utils/exportReport';

type AppScreen = 'home' | 'analysis';

interface SelectedImage {
  file: File;
  url: string;
}

const App: React.FC = () => {
  // Screen state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Theme hook
  const { isDark, toggleTheme } = useTheme();

  // API hooks
  const prediction = usePrediction();
  const modelInfo = useModelInfo();

  // Cleanup image URL on unmount or change
  useEffect(() => {
    return () => {
      if (selectedImage?.url) {
        URL.revokeObjectURL(selectedImage.url);
      }
    };
  }, [selectedImage]);

  // Handle file selection from HomeScreen
  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Clear previous state
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }
    prediction.reset();
    setValidationError(null);

    // Create preview URL and set state
    const url = URL.createObjectURL(file);
    setSelectedImage({ file, url });
    setCurrentScreen('analysis');
  }, [selectedImage, prediction]);

  // Handle running diagnosis
  const handleRunDiagnosis = useCallback(async () => {
    if (!selectedImage?.file) return;
    await prediction.predict(selectedImage.file);
  }, [selectedImage, prediction]);

  // Handle changing photo (back to home)
  const handleChangePhoto = useCallback(() => {
    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }
    setSelectedImage(null);
    prediction.reset();
    setValidationError(null);
    setCurrentScreen('home');
  }, [selectedImage, prediction]);

  // Handle export report
  const handleExportReport = useCallback(() => {
    if (!prediction.data || !selectedImage?.file) return;

    exportReport({
      predictions: prediction.data,
      modelInfo: modelInfo.data ?? null,
      fileName: selectedImage.file.name,
    });
  }, [prediction.data, modelInfo.data, selectedImage]);

  // Determine subtitle based on screen
  const getSubtitle = () => {
    if (currentScreen === 'home') {
      return 'AI-powered dermatological diagnostic support';
    }
    return 'Review image and run diagnostic model';
  };

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text transition-colors">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8 flex flex-col">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Skin Lesion Analysis
            </h1>
            <p className="theme-text-secondary mt-2">{getSubtitle()}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportReport}
              disabled={prediction.status !== 'success'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full theme-border border font-semibold text-sm theme-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-surface"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Screen content with transitions */}
        <div className="flex-1 flex flex-col">
          {currentScreen === 'home' ? (
            <div className="animate-fade-in flex-1 flex flex-col">
              <HomeScreen
                onFileSelect={handleFileSelect}
                validationError={validationError}
                onValidationError={setValidationError}
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              {selectedImage && (
                <AnalysisScreen
                  imageUrl={selectedImage.url}
                  onRunDiagnosis={handleRunDiagnosis}
                  onChangePhoto={handleChangePhoto}
                  predictionStatus={prediction.status}
                  predictionData={prediction.data}
                  predictionError={prediction.error}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <MetricsDisplay
        metrics={modelInfo.data?.metrics}
        modelName={modelInfo.data?.model_name}
        isLoading={modelInfo.status === 'loading'}
      />
    </div>
  );
};

export default App;
