import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="mb-4 bg-green-500/20 border border-green-500 rounded-lg px-4 py-3 flex items-start gap-2">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-white flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;