import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, Clock, Plus, Check, AlertCircle, Play } from 'lucide-react';
import { movieAPI, watchlistAPI } from '../../services/api';
import EmbedPlayer from './EmbedPlayer';
import Loading from './Loading';
import { useAuth } from '../../context/AuthContext';

const MovieDetailsModal = ({ movieId, onClose, isInWatchlist: initialWatchlistState, onWatchlistChange }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(initialWatchlistState);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const { requireAuthForAction } = useAuth();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await movieAPI.getMovieDetails(movieId);
        if (result.success) {
          setMovie(result.data);
        } else {
          setError(result.message || 'Failed to load movie details');
        }
      } catch (err) {
        setError('Unable to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (movieId) fetchMovieDetails();
  }, [movieId]);

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    setAddingToWatchlist(true);
    setError('');
    try {
      if (isInWatchlist) {
        const result = await watchlistAPI.removeFromWatchlist(movieId);
        if (result.success) {
          setIsInWatchlist(false);
          if (onWatchlistChange) onWatchlistChange();
        } else {
          setError(result.message || 'Failed to remove from watchlist');
        }
        setAddingToWatchlist(false);
      } else {
        setAddingToWatchlist(false);
        requireAuthForAction(async () => {
          setAddingToWatchlist(true);
          const result = await watchlistAPI.addToWatchlist({
            id: movie.id, title: movie.title, overview: movie.overview,
            poster_path: movie.poster_path, release_date: movie.release_date,
          });
          if (result.success) {
            setIsInWatchlist(true);
            if (onWatchlistChange) onWatchlistChange();
          } else {
            setError(result.message || 'Failed to add to watchlist');
          }
          setAddingToWatchlist(false);
        });
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setAddingToWatchlist(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-black rounded-lg p-8 max-w-4xl w-full"><Loading /></div>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-dark rounded-lg p-6 max-w-md w-full border border-netflix-dark-light">
          <div className="flex items-center mb-4 text-netflix-red"><AlertCircle className="w-5 h-5 mr-2" /><h3 className="text-lg font-semibold">Error</h3></div>
          <p className="text-netflix-gray-light mb-6">{error}</p>
          <button onClick={onClose} className="btn-netflix w-full">Close</button>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const genres = movie.genres?.map(g => g.name).join(' · ') || '';
  const runtime = movie.runtime > 0 ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-netflix-black rounded-lg max-w-5xl w-full my-8 md:my-16 animate-scale-in border border-netflix-dark-light overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {backdropUrl && (
          <div className="relative h-56 md:h-80">
            <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {showPlayer && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Now Playing: {movie.title}</h3>
              <EmbedPlayer mediaType="movie" tmdbId={movie.id} title={movie.title} />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-56">
              {posterUrl && <img src={posterUrl} alt={movie.title} className="rounded-lg shadow-2xl w-full" onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="%23222" width="300" height="450"/><text fill="%23555" font-family="sans-serif" font-size="14" x="150" y="225" text-anchor="middle" dominant-baseline="middle">No Poster</text></svg>'; }} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{movie.title}</h2>
              {movie.tagline && <p className="text-netflix-gray italic mb-3">"{movie.tagline}"</p>}

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded font-semibold">
                    <Star className="w-4 h-4" fill="currentColor" /> {movie.vote_average.toFixed(1)}
                  </span>
                )}
                {movie.release_date && (
                  <span className="flex items-center gap-1 text-netflix-gray-light"><Calendar className="w-4 h-4" /> {new Date(movie.release_date).getFullYear()}</span>
                )}
                {runtime && <span className="flex items-center gap-1 text-netflix-gray-light"><Clock className="w-4 h-4" /> {runtime}</span>}
                {genres && <span className="text-netflix-gray-light">{genres}</span>}
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={() => setShowPlayer(!showPlayer)} className="btn-play px-6 py-2.5">
                  <Play className="w-5 h-5" fill="currentColor" /> {showPlayer ? 'Hide Player' : 'Play'}
                </button>
                <button
                  onClick={handleWatchlistToggle}
                  disabled={addingToWatchlist}
                  className={`btn-more-info px-6 py-2.5 ${isInWatchlist ? 'bg-green-600/80 hover:bg-green-600 border-none' : ''} ${addingToWatchlist ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {addingToWatchlist ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{isInWatchlist ? 'Removing...' : 'Adding...'}</>
                  ) : isInWatchlist ? (
                    <><Check className="w-4 h-4 mr-2" /> In My Watchlist</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> My Watchlist</>
                  )}
                </button>
              </div>

              {movie.overview && <p className="text-white/80 leading-relaxed mb-6">{movie.overview}</p>}

              {error && (
                <div className="mb-4 p-3 bg-netflix-red/20 border border-netflix-red/50 text-white rounded-lg flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /><span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-netflix-dark rounded-lg border border-netflix-dark-light">
                {movie.budget > 0 && <div><p className="text-netflix-gray text-xs mb-1">Budget</p><p className="font-semibold">${(movie.budget / 1000000).toFixed(1)}M</p></div>}
                {movie.revenue > 0 && <div><p className="text-netflix-gray text-xs mb-1">Revenue</p><p className="font-semibold">${(movie.revenue / 1000000).toFixed(1)}M</p></div>}
                {movie.status && <div><p className="text-netflix-gray text-xs mb-1">Status</p><p className="font-semibold">{movie.status}</p></div>}
                {movie.original_language && <div><p className="text-netflix-gray text-xs mb-1">Language</p><p className="font-semibold uppercase">{movie.original_language}</p></div>}
              </div>

              {movie.homepage && (
                <div className="mt-4 pt-4 border-t border-netflix-dark-light">
                  <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline text-sm">Official Website</a>
                </div>
              )}
              {movie.imdb_id && (
                <div className="mt-2">
                  <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:underline text-sm">View on IMDb</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;