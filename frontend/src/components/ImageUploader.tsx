import { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, formatFileSize, MAX_FILE_SIZE_MB } from '../utils/validation';

interface ImageUploaderProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, onFileRemove }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Validation Error</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload area or Preview */}
      {!preview ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            group relative flex flex-col items-center justify-center gap-6
            rounded-xl border-2 border-dashed
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-slate-700 bg-slate-800/30 hover:border-primary/50'
            }
            px-6 py-12 flex-1 min-h-[500px]
            transition-all cursor-pointer
          `}
        >
          {/* Upload icon */}
          <div className={`
            w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary
            ${isDragging ? 'scale-110' : 'group-hover:scale-110'}
            transition-transform duration-300
          `}>
            <Upload className="w-16 h-16" strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <p className="text-3xl font-bold text-slate-100">Upload Skin Image</p>
            <p className="text-slate-400 text-base max-w-md mx-auto">
              Drag and drop or click to upload a high-resolution image of the lesion for analysis.
            </p>
            <p className="text-slate-500 text-sm mt-4">
              Supported formats: JPEG, PNG, WebP (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>

          {/* Button */}
          <button
            type="button"
            className="px-10 py-3 bg-slate-100 text-slate-900 rounded-full font-bold text-base mt-4 hover:shadow-lg hover:shadow-white/10 transition-shadow"
          >
            Select File
          </button>
        </div>
      ) : (
        <div className="relative flex-1 min-h-[500px] rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800/30">
          {/* Preview image */}
          <img
            src={preview}
            alt="Selected skin lesion"
            className="w-full h-full object-contain bg-slate-900/50"
          />

          {/* Overlay with file info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-slate-100 font-semibold text-sm truncate max-w-[200px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {selectedFile && formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={handleRemove}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Change image button */}
          <button
            onClick={handleClick}
            className="absolute top-4 right-4 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full text-sm font-medium text-slate-200 transition-colors backdrop-blur-sm"
          >
            Change Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
