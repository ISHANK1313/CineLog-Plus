import React, { useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Film } from 'lucide-react';
import { getEmbedUrls } from '../../services/api';

const EmbedPlayer = ({ mediaType = 'movie', tmdbId, season = 1, episode = 1, title = '' }) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const embedUrls = getEmbedUrls(mediaType, tmdbId, season, episode);

  const handleError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const switchSource = useCallback((index) => {
    setCurrentSource(index);
    setLoading(true);
    setError(false);
    setIframeKey(prev => prev + 1);
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setIframeKey(prev => prev + 1);
  }, []);

  if (!embedUrls.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-netflix-dark rounded-lg">
        <Film className="w-16 h-16 text-netflix-gray mb-4" />
        <p className="text-netflix-gray-light text-lg">No embed sources available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden shadow-2xl">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
              <p className="text-netflix-gray-light text-sm">Loading player...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-netflix-dark z-10 p-6">
            <AlertTriangle className="w-14 h-14 text-yellow-400 mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">Source unavailable</h3>
            <p className="text-netflix-gray-light text-sm mb-4 text-center max-w-md">
              {embedUrls[currentSource]?.name} failed to load. Try another source below.
            </p>
            <button onClick={retry} className="btn-netflix-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={embedUrls[currentSource]?.url}
          className="w-full h-full"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title={`${title || ''} - ${embedUrls[currentSource]?.name}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ border: 'none', background: 'black' }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-netflix-gray mr-1">Sources:</span>
        {embedUrls.map((source, index) => (
          <button
            key={source.name}
            onClick={() => switchSource(index)}
            className={`px-3 py-1 text-xs rounded font-medium transition-all ${
              currentSource === index
                ? 'bg-netflix-red text-white'
                : 'bg-netflix-dark-light text-netflix-gray-light hover:bg-netflix-gray hover:text-white'
            }`}
          >
            {source.name}
          </button>
        ))}
        <button
          onClick={retry}
          className="ml-auto p-1.5 text-netflix-gray hover:text-white transition-colors"
          title="Reload"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-netflix-gray mt-1">
          Tip: Try switching sources above. Some may be blocked in your region.
        </p>
      )}
    </div>
  );
};

export default EmbedPlayer;