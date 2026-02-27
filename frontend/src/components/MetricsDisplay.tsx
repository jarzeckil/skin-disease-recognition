import { Github, Cpu } from 'lucide-react';
import { useModelInfo } from '../hooks';

const MetricsDisplay: React.FC = () => {
  const { status, data: modelInfo } = useModelInfo();

  // Format version: if it's a plain number, prefix with "v"
  const formatVersion = (version: string | number): string => {
    const versionStr = String(version);
    // If it's just a number or doesn't start with 'v', add 'v' prefix
    if (/^\d+$/.test(versionStr)) {
      return `v${versionStr}`;
    }
    return versionStr;
  };

  return (
    <footer className="mt-auto border-t theme-border theme-bg-secondary py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-4">
          {/* Model info and links row */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Model info */}
            {status === 'success' && modelInfo && (
              <div className="flex items-center gap-2 text-xs font-medium theme-text-muted">
                <Cpu className="w-4 h-4" />
                <span>{modelInfo.model_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                  {formatVersion(modelInfo.model_version)}
                </span>
              </div>
            )}

            <a
              href="https://github.com/jarzeckil/skin-disease-recognition"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium theme-text-muted hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              Source on GitHub
            </a>
          </div>

          {/* Disclaimer */}
          <div className="border-t theme-border pt-4">
            <p className="text-[11px] theme-text-muted text-center leading-relaxed max-w-2xl mx-auto">
              <span className="font-bold text-primary/60">Disclaimer:</span>{' '}
              This tool is for research and educational purposes only and does not constitute medical advice. 
              Consult a healthcare professional for diagnosis.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MetricsDisplay;
