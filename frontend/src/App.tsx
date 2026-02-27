/**
 * Main App Component
 * State-driven UI with tabs: Analysis and Model Performance
 */

import { useState, useCallback, useEffect } from 'react';
import { Download, Activity, BarChart3 } from 'lucide-react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ClassificationReport from './components/ClassificationReport';
import MetricsDisplay from './components/MetricsDisplay';
import Sidebar, { type SortMetric } from './components/Sidebar';
import { usePrediction, useModelInfo, useTheme } from './hooks';
import { validateImageFile } from './utils/validation';
import { exportReport } from './utils/exportReport';

type AppTab = 'analysis' | 'performance';
type AnalysisScreen_State = 'home' | 'results';

interface SelectedImage {
  file: File;
  url: string;
}

const App: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<AppTab>('analysis');
  
  // Analysis screen state (within Analysis tab)
  const [analysisState, setAnalysisState] = useState<AnalysisScreen_State>('home');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Model Performance filter/sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMetric, setSortMetric] = useState<SortMetric>('f1-desc');

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
    setAnalysisState('results');
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
    setAnalysisState('home');
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

  // Get page title and subtitle based on active tab
  const getPageContent = () => {
    if (activeTab === 'performance') {
      return {
        title: 'Model Performance',
        subtitle: 'Classification Report & Heatmap Analysis',
      };
    }
    return {
      title: 'Skin Lesion Analysis',
      subtitle: analysisState === 'home' 
        ? 'AI-powered dermatological diagnostic support'
        : 'Review image and run diagnostic model',
    };
  };

  const pageContent = getPageContent();

  return (
    <div className="flex flex-col min-h-screen theme-bg theme-text transition-colors">
      <Header isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-6 flex flex-col overflow-hidden">
        {/* Page header with tabs */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {pageContent.title}
              </h1>
              <p className="theme-text-secondary mt-2">{pageContent.subtitle}</p>
            </div>

            {/* Action buttons - only show on Analysis tab with results */}
            {activeTab === 'analysis' && analysisState === 'results' && (
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
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                activeTab === 'analysis'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'theme-surface theme-border border theme-text-secondary theme-surface-hover'
              }`}
            >
              <Activity className="w-4 h-4" />
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                activeTab === 'performance'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'theme-surface theme-border border theme-text-secondary theme-surface-hover'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Model Performance
            </button>
          </div>
        </div>

        {/* Tab content with transitions */}
        <div className="flex-1 flex flex-col overflow-auto">
          {activeTab === 'analysis' ? (
            // Analysis Tab Content
            <div className="animate-fade-in flex-1 flex flex-col">
              {analysisState === 'home' ? (
                <HomeScreen
                  onFileSelect={handleFileSelect}
                  validationError={validationError}
                  onValidationError={setValidationError}
                />
              ) : (
                selectedImage && (
                  <AnalysisScreen
                    imageUrl={selectedImage.url}
                    onRunDiagnosis={handleRunDiagnosis}
                    onChangePhoto={handleChangePhoto}
                    predictionStatus={prediction.status}
                    predictionData={prediction.data}
                    predictionError={prediction.error}
                  />
                )
              )}
            </div>
          ) : (
            // Model Performance Tab Content
            <div className="animate-fade-in flex-1 flex overflow-hidden">
              <Sidebar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortMetric={sortMetric}
                onSortChange={setSortMetric}
              />
              <div className="flex-1 overflow-auto p-1">
                <ClassificationReport
                  searchQuery={searchQuery}
                  sortMetric={sortMetric}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <MetricsDisplay
        metrics={modelInfo.data?.metrics}
        modelName={modelInfo.data?.model_info.model_name}
        modelVersion={modelInfo.data?.model_info.model_version}
        isLoading={modelInfo.status === 'loading'}
      />
    </div>
  );
};

export default App;
