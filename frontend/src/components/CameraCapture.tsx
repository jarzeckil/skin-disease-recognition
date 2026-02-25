/**
 * CameraCapture - Modal component for capturing images from webcam using WebRTC
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type CameraState = 'initializing' | 'ready' | 'captured' | 'error';

const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [cameraState, setCameraState] = useState<CameraState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraState('initializing');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('ready');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraState('error');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setErrorMessage('Camera access denied. Please allow camera permissions in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No camera found on this device.');
        } else if (error.name === 'NotReadableError') {
          setErrorMessage('Camera is already in use by another application.');
        } else {
          setErrorMessage(`Failed to access camera: ${error.message}`);
        }
      } else {
        setErrorMessage('An unknown error occurred while accessing the camera.');
      }
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    setCameraState('captured');

    // Stop the camera stream after capture
    stopCamera();
  }, [stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Confirm and use captured photo
  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    // Convert canvas to blob and create File
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const file = new File([blob], `camera-capture-${timestamp}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
          handleClose();
        }
      },
      'image/jpeg',
      0.9
    );
  }, [capturedImage, onCapture]);

  // Handle modal close
  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setCameraState('initializing');
    setErrorMessage('');
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl theme-surface rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b theme-border">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold theme-text">Camera Capture</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full theme-surface-hover transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5 theme-text-secondary" />
          </button>
        </div>

        {/* Camera view / Captured image */}
        <div className="relative aspect-[4/3] bg-black">
          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error state */}
          {cameraState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-2">Camera Error</p>
                <p className="text-sm text-slate-400 max-w-sm">{errorMessage}</p>
              </div>
              <button
                onClick={startCamera}
                className="mt-2 px-6 py-2 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Initializing state */}
          {cameraState === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-slate-400 font-medium">Starting camera...</p>
            </div>
          )}

          {/* Video stream */}
          {(cameraState === 'ready' || cameraState === 'initializing') && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraState === 'initializing' ? 'opacity-0' : 'opacity-100'}`}
            />
          )}

          {/* Captured image preview */}
          {cameraState === 'captured' && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          {/* Capture guide overlay */}
          {cameraState === 'ready' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/80 text-sm font-medium bg-black/40 inline-block px-4 py-1 rounded-full">
                  Position the skin lesion within the frame
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 flex justify-center gap-4">
          {cameraState === 'ready' && (
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          )}

          {cameraState === 'captured' && (
            <>
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 theme-surface theme-border border rounded-full font-semibold text-sm theme-text-secondary theme-surface-hover transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-500 shadow-lg transition-all"
              >
                <Check className="w-5 h-5" />
                Use Photo
              </button>
            </>
          )}

          {cameraState === 'error' && (
            <button
              onClick={handleClose}
              className="px-6 py-3 theme-surface theme-border border rounded-full font-semibold text-sm theme-text-secondary theme-surface-hover transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
