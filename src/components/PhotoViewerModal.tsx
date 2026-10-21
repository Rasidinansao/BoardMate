import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  photoUrl,
  title,
  subtitle,
  onClose,
}) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h3 className="font-semibold text-white text-base">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close photo viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative flex-1 bg-black/50 overflow-hidden flex items-center justify-center p-2 min-h-[320px]">
          <img
            src={photoUrl}
            alt={title}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            Verified local storage attachment
          </span>
          <button
            onClick={() => window.open(photoUrl, '_blank')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Full Size
          </button>
        </div>
      </div>
    </div>
  );
};
