import React from 'react';

const Loading = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-netflix-red border-t-transparent rounded-full animate-spin" />
          <span className="text-netflix-gray text-sm">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-netflix-red border-t-transparent rounded-full animate-spin" />
        <span className="text-netflix-gray text-sm">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;