import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, TrendingUp, Tv } from 'lucide-react';
import { movieAPI, tvAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../src/components/MovieCard';
import MovieDetailsModal from '../src/components/MovieDetailsModal';
import TvDetailsModal from '../src/components/TvDetailsModal';
import Loading from '../src/components/Loading';
import ErrorMessage from '../src/components/ErrorMessage';

const Search = () => {
  const [query, setQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [tvResults, setTvResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedTvId, setSelectedTvId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) refreshWatchlist();
    movieAPI.getTrendingMovies().then(res => {
      if (res.success && res.data?.results) setTrendingMovies(res.data.results.slice(0, 12));
    });
    tvAPI.getTrendingTv().then(res => {
      if (res.success && res.data?.results) setTrendingTv(res.data.results.slice(0, 12));
    });
  }, [isAuthenticated]);

  const refreshWatchlist = async () => {
    const result = await watchlistAPI.getWatchlist();
    if (result.success) {
      setWatchlistIds(new Set(result.data.map((item) => item.tmdbMovieId)));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setError('Please enter a title'); return; }
    setLoading(true); setError(''); setHasSearched(true);
    try {
      const [movieRes, tvRes] = await Promise.all([
        movieAPI.searchMovies(query),
        tvAPI.searchTv ? tvAPI.searchTv(query) : Promise.resolve({ success: false, data: { results: [] } })
      ]);
      if (movieRes.success) setMovieResults(movieRes.data.results || []);
      else setMovieResults([]);
      if (tvRes.success) setTvResults(tvRes.data.results || []);
      else setTvResults([]);
    } catch (err) { setError('An error occurred'); setMovieResults([]); setTvResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-netflix-black min-h-screen pt-20">
      <div className="px-4 md:px-16 py-8">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">Search</h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Titles, people, genres" autoFocus
                className="w-full bg-netflix-dark text-black border-2 border-netflix-dark-light rounded px-5 py-4 pl-14 text-lg focus:outline-none focus:border-white transition-colors duration-200 placeholder-netflix-gray"
              />
              <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-netflix-gray" />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setHasSearched(false); setMovieResults([]); setTvResults([]); }}
                  className="absolute right-16 top-1/2 -translate-y-1/2 text-netflix-gray-light hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button type="submit" disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-netflix-red hover:bg-netflix-red-hover text-white font-semibold px-6 py-2.5 rounded transition-colors">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
        </div>
        <ErrorMessage message={error} onClose={() => setError('')} />
        {loading ? <Loading /> : (
          <div className="max-w-7xl mx-auto">
            {!hasSearched && ((trendingMovies.length > 0) || (trendingTv.length > 0)) && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-netflix-red" />
                  <h2 className="section-header mb-0">Trending</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {trendingMovies.map((movie) => (
                    <MovieCard key={`m-${movie.id}`} movie={movie} isInWatchlist={watchlistIds.has(movie.id)}
                      onWatchlistChange={refreshWatchlist} onDetailsClick={(movie) => setSelectedMovieId(movie.id)} />
                  ))}
                  {trendingTv.map((tv) => (
                    <MovieCard key={`t-${tv.id}`} movie={{ ...tv, media_type: 'tv' }} isInWatchlist={watchlistIds.has(tv.id)}
                      onWatchlistChange={refreshWatchlist} onDetailsClick={(tv) => setSelectedTvId(tv.id)} />
                  ))}
                </div>
              </section>
            )}
            {hasSearched && movieResults.length === 0 && tvResults.length === 0 && (
              <div className="text-center py-20">
                <SearchIcon className="w-16 h-16 text-netflix-gray mx-auto mb-4" />
                <p className="text-netflix-gray text-lg">No results found for "{query}"</p>
              </div>
            )}
            {movieResults.length > 0 && (
              <section className="mb-12">
                <h2 className="section-header mb-6">Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {movieResults.map((movie) => (
                    <MovieCard key={`m-${movie.id}`} movie={movie} isInWatchlist={watchlistIds.has(movie.id)}
                      onWatchlistChange={refreshWatchlist} onDetailsClick={(movie) => setSelectedMovieId(movie.id)} />
                  ))}
                </div>
              </section>
            )}
            {tvResults.length > 0 && (
              <section>
                <h2 className="section-header mb-6 flex items-center gap-2">
                  <Tv className="w-5 h-5 text-netflix-red" /> TV Series
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {tvResults.map((tv) => (
                    <MovieCard key={`t-${tv.id}`} movie={{ ...tv, media_type: 'tv' }} isInWatchlist={watchlistIds.has(tv.id)}
                      onWatchlistChange={refreshWatchlist} onDetailsClick={(tv) => setSelectedTvId(tv.id)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      {selectedMovieId && (
        <MovieDetailsModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)}
          isInWatchlist={watchlistIds.has(selectedMovieId)} onWatchlistChange={refreshWatchlist} />
      )}
      {selectedTvId && <TvDetailsModal tvId={selectedTvId} onClose={() => setSelectedTvId(null)} />}
    </div>
  );
};

export default Search;