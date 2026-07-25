import React, { useState } from 'react';
import { Play, Plus, Check, ChevronDown, Star } from 'lucide-react';
import { watchlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MovieCard = ({ movie, isInWatchlist = false, onWatchlistChange, onDetailsClick }) => {
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { requireAuthForAction } = useAuth();

  const posterUrl = movie.poster_path || movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.posterPath}`
    : null;

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      // Removing from watchlist — always allowed
      setAddingToWatchlist(true);
      try {
        const result = await watchlistAPI.removeFromWatchlist(movie.id || movie.tmdbMovieId);
        if (result.success) {
          setInWatchlist(false);
          if (onWatchlistChange) onWatchlistChange();
        }
      } catch (error) {
        console.error('Watchlist error:', error);
      } finally {
        setAddingToWatchlist(false);
      }
    } else {
      // Adding to watchlist — require auth first
      requireAuthForAction(async () => {
        setAddingToWatchlist(true);
        try {
          const result = await watchlistAPI.addToWatchlist(movie);
          if (result.success) {
            setInWatchlist(true);
            if (onWatchlistChange) onWatchlistChange();
          }
        } catch (error) {
          console.error('Watchlist error:', error);
        } finally {
          setAddingToWatchlist(false);
        }
      });
    }
  };

  const handleDetailsClick = () => {
    if (onDetailsClick) onDetailsClick(movie);
  };

  const rating = movie.vote_average || movie.voteAverage;
  const year = movie.release_date || movie.releaseDate
    ? new Date(movie.release_date || movie.releaseDate).getFullYear()
    : null;

  return (
    <div
      className="netflix-card group"
      onClick={handleDetailsClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-netflix-dark">
        {/* Loading skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="%23222" width="300" height="450"/><text fill="%23555" font-family="sans-serif" font-size="14" x="150" y="225" text-anchor="middle" dominant-baseline="middle">No Poster</text></svg>';
              setImgLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-netflix-gray text-sm">
            No Poster
          </div>
        )}

        {/* Netflix-style hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Rating badge top-right */}
          {rating > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-white">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
              {rating.toFixed(1)}
            </div>
          )}

          {/* Bottom gradient with action buttons */}
          <div className="absolute bottom-0 left-0 right-0 bg-card-gradient p-3">
            <div className="flex items-center gap-2 mb-2">
              {/* Play button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-white/80 transition-colors flex-shrink-0"
              >
                <Play className="w-4 h-4 text-black fill-black ml-0.5" />
              </button>

              {/* Add/Remove Watchlist */}
              <button
                onClick={handleWatchlistToggle}
                disabled={addingToWatchlist}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  inWatchlist
                    ? 'bg-white/20 border-white text-white hover:bg-white/30'
                    : 'border-netflix-gray-light text-white hover:border-white hover:bg-white/10'
                }`}
              >
                {addingToWatchlist ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : inWatchlist ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>

              {/* More info */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}
                className="w-8 h-8 rounded-full border-2 border-netflix-gray-light text-white hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-auto"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Title and metadata */}
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {movie.title}
            </p>
            {year && (
              <p className="text-netflix-gray text-[10px] mt-0.5">{year}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;