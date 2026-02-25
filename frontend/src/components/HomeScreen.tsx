/**
 * HomeScreen - Initial screen with two options: Upload or Take Photo
 * Based on dark_mode_refined_analysis_2 reference
 */

import { useRef } from 'react';
import { Upload, Camera } from 'lucide-react';

interface HomeScreenProps {
  onFileSelect: (file: File) => void;
  validationError: string | null;
  onValidationError: (error: string | null) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onFileSelect, 
  validationError,
  onValidationError 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onValidationError(null);
      onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Validation Error */}
      {validationError && (
        <div className="max-w-5xl mx-auto w-full px-4 mb-6">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 font-medium text-sm">{validationError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full py-8 md:py-16 px-4">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Card */}
        <div
          onClick={handleUploadClick}
          className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed theme-border theme-surface px-6 py-12 md:py-16 hover:border-primary/50 transition-all cursor-pointer h-full min-h-[320px]"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold theme-text">Upload Skin Image</p>
            <p className="theme-text-secondary text-sm max-w-xs mx-auto">
              Drag and drop or select a file
            </p>
          </div>
          <button
            type="button"
            className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-shadow mt-4"
          >
            Select File
          </button>
          <p className="theme-text-muted text-xs mt-2">Supported: JPEG, PNG, WEBP</p>
        </div>

        {/* Camera Card */}
        <div
          onClick={handleCameraClick}
          className="relative flex flex-col items-center justify-center gap-6 rounded-xl border theme-border theme-surface px-6 py-12 md:py-16 h-full min-h-[320px] cursor-pointer hover:border-primary/30 transition-all"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full theme-bg-secondary flex items-center justify-center mb-2">
              <Camera className="w-10 h-10 theme-text-muted" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold theme-text">Take Photo</h3>
            <p className="theme-text-secondary text-sm max-w-xs">
              Use your device camera to capture a new image
            </p>
          </div>
          <div className="w-full flex justify-center mt-2">
            <button
              type="button"
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <Camera className="w-4 h-4" />
              Activate Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
