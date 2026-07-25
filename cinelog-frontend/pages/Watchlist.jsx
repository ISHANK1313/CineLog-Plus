import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../services/api';
import MovieDetailsModal from '../src/components/MovieDetailsModal';
import Loading from '../src/components/Loading';
import ErrorMessage from '../src/components/ErrorMessage';
import SuccessMessage from '../src/components/SuccessMessage';
import { Link } from 'react-router-dom';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetchWatchlist();
  }, [isAuthenticated]);

  const fetchWatchlist = async () => {
    setLoading(true); setError('');
    try {
      const result = await watchlistAPI.getWatchlist();
      if (result.success) setWatchlist(result.data || []);
      else setError(result.message || 'Failed to load watchlist');
    } catch (err) { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (tmdbMovieId, title) => {
    setRemovingId(tmdbMovieId); setError(''); setSuccess('');
    try {
      const result = await watchlistAPI.removeFromWatchlist(tmdbMovieId);
      if (result.success) {
        setWatchlist((prev) => prev.filter((item) => item.tmdbMovieId !== tmdbMovieId));
        setSuccess(`"${title}" removed from watchlist`);
        setTimeout(() => setSuccess(''), 3000);
      } else setError(result.message || 'Failed to remove');
    } catch (err) { setError('An error occurred'); }
    finally { setRemovingId(null); }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-netflix-black min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <Bookmark className="w-20 h-20 text-netflix-gray mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Your Watchlist Awaits</h1>
          <p className="text-netflix-gray text-lg mb-8 max-w-md mx-auto">
            Sign up to save movies and never lose track of what you want to watch.
          </p>
          <Link to="/" className="btn-netflix text-base px-10 py-3">Browse Movies</Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loading fullScreen />;

  return (
    <div className="bg-netflix-black min-h-screen pt-20">
      <div className="px-4 md:px-16 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-netflix-red" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">My Watchlist</h1>
          </div>
          <p className="text-netflix-gray ml-11">{watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved</p>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />
        <SuccessMessage message={success} onClose={() => setSuccess('')} />

        {watchlist.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-20 h-20 text-netflix-gray mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">Your watchlist is empty</h2>
            <p className="text-netflix-gray mb-8">Add movies to keep track of what you want to watch</p>
            <Link to="/" className="btn-netflix inline-flex"><ArrowLeft className="w-5 h-5" /> Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {watchlist.map((item) => {
              const posterUrl = item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : null;
              return (
                <div key={item.id} className="netflix-card group animate-fade-in">
                  <div className="relative aspect-[2/3] overflow-hidden bg-netflix-dark">
                    {posterUrl ? (
                      <img src={posterUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                        onClick={() => setSelectedMovieId(item.tmdbMovieId)} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-netflix-gray text-sm cursor-pointer"
                        onClick={() => setSelectedMovieId(item.tmdbMovieId)}>No Poster</div>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 bg-card-gradient p-3">
                        <button onClick={(e) => { e.stopPropagation(); handleRemove(item.tmdbMovieId, item.title); }}
                          disabled={removingId === item.tmdbMovieId}
                          className={`w-full py-2 px-4 rounded font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                            removingId === item.tmdbMovieId ? 'bg-red-500/50 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                          }`}>
                          {removingId === item.tmdbMovieId ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Removing</> : <><Trash2 className="w-4 h-4" /> Remove</>}
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2"><span className="badge-netflix">In Watchlist</span></div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-white truncate cursor-pointer hover:text-white/80" onClick={() => setSelectedMovieId(item.tmdbMovieId)}>{item.title}</h3>
                    {item.releaseDate && <p className="text-netflix-gray text-xs">{new Date(item.releaseDate).getFullYear()}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMovieId && <MovieDetailsModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} isInWatchlist={true} onWatchlistChange={fetchWatchlist} />}
    </div>
  );
};

export default Watchlist;