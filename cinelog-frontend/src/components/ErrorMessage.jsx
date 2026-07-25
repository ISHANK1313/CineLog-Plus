import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="mb-4 bg-netflix-red bg-opacity-20 border border-netflix-red rounded-lg px-4 py-3 flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-netflix-red flex-shrink-0 mt-0.5" />
      <span className="text-sm text-white flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;