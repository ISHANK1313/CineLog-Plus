import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, Play, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { movieAPI, tvAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../src/components/MovieCard';
import MovieDetailsModal from '../src/components/MovieDetailsModal';
import TvDetailsModal from '../src/components/TvDetailsModal';
import Loading from '../src/components/Loading';
import ErrorMessage from '../src/components/ErrorMessage';

const SECTIONS = [
  { key: 'trending', label: 'Trending Now', type: 'movie', loadMore: true },
  { key: 'popular', label: 'Popular on CineLog', type: 'movie', loadMore: true },
  { key: 'trendingTv', label: 'Trending TV Series', type: 'tv', loadMore: false },
  { key: 'popularTv', label: 'Popular TV Series', type: 'tv', loadMore: true },
];

const Home = () => {
  const [heroMovie, setHeroMovie] = useState(null);
  const [rows, setRows] = useState({});
  const [rowPages, setRowPages] = useState({ trending: 1, popular: 1, popularTv: 1 });
  const [loadingMore, setLoadingMore] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedTvId, setSelectedTvId] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trendingRes, popularRes, trendingTvRes, popularTvRes] = await Promise.all([
        movieAPI.getTrendingMovies(),
        movieAPI.getPopularMovies(1),
        tvAPI.getTrendingTv(),
        tvAPI.getPopularTv(1),
      ]);

      const newRows = {};
      let heroCandidate = null;

      if (trendingRes.success && trendingRes.data?.results?.length) {
        newRows.trending = trendingRes.data.results;
        heroCandidate = trendingRes.data.results[Math.floor(Math.random() * Math.min(5, trendingRes.data.results.length))];
      }
      if (popularRes.success && popularRes.data?.results?.length) {
        newRows.popular = popularRes.data.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }
      if (trendingTvRes.success && trendingTvRes.data?.results?.length) {
        newRows.trendingTv = trendingTvRes.data.results;
        if (!heroCandidate) {
          heroCandidate = trendingTvRes.data.results[0];
        }
      }
      if (popularTvRes.success && popularTvRes.data?.results?.length) {
        newRows.popularTv = popularTvRes.data.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      setRows(newRows);
      if (heroCandidate && !heroMovie) setHeroMovie(heroCandidate);

      if (isAuthenticated) {
        const watchlistRes = await watchlistAPI.getWatchlist();
        if (watchlistRes.success) {
          setWatchlistIds(new Set(watchlistRes.data.map((item) => item.tmdbMovieId)));
        }
      }
    } catch (err) {
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (sectionKey, page) => {
    setLoadingMore(prev => ({ ...prev, [sectionKey]: true }));
    setError('');
    try {
      let result;
      if (sectionKey === 'trending') {
        result = await movieAPI.getTrendingMovies();
      } else if (sectionKey === 'popular') {
        result = await movieAPI.getPopularMovies(page);
      } else if (sectionKey === 'popularTv') {
        result = await tvAPI.getPopularTv(page);
      }

      if (result.success && result.data?.results?.length) {
        setRows(prev => ({
          ...prev,
          [sectionKey]: [...(prev[sectionKey] || []), ...result.data.results],
        }));
        setRowPages(prev => ({ ...prev, [sectionKey]: page }));
      } else {
        setError('No more items to load.');
      }
    } catch (err) {
      setError('Failed to load more content.');
    } finally {
      setLoadingMore(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const refreshWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;
    const result = await watchlistAPI.getWatchlist();
    if (result.success) {
      setWatchlistIds(new Set(result.data.map((item) => item.tmdbMovieId)));
    }
  }, [isAuthenticated]);

  if (loading) return <Loading fullScreen />;

  return (
    <div className="bg-netflix-black min-h-screen">
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <ErrorMessage message={error} onClose={() => setError('')} />
        </div>
      )}

      {heroMovie && (
        <HeroBanner
          movie={heroMovie}
          mediaType={heroMovie.title ? 'movie' : 'tv'}
          onPlayClick={() => {
            if (heroMovie.title) setSelectedMovieId(heroMovie.id);
            else setSelectedTvId(heroMovie.id);
          }}
          onDetailsClick={() => {
            if (heroMovie.title) setSelectedMovieId(heroMovie.id);
            else setSelectedTvId(heroMovie.id);
          }}
        />
      )}

      <div className={`relative z-10 ${heroMovie ? '-mt-20 md:-mt-32' : 'pt-32'} pb-32`}>
        <div className="space-y-8 md:space-y-12">
          {SECTIONS.map(({ key, label, type, loadMore: hasLoadMore }) => {
            const movies = rows[key];
            if (!movies?.length) return null;
            return (
              <MovieRow
                key={key}
                title={label}
                movies={movies}
                type={type}
                watchlistIds={watchlistIds}
                onWatchlistChange={refreshWatchlist}
                onDetailsClick={(movie) => {
                  if (type === 'movie') setSelectedMovieId(movie.id);
                  else setSelectedTvId(movie.id);
                }}
                loadingMore={loadingMore[key]}
                onLoadMore={() => {
                  const nextPage = (rowPages[key] || 1) + 1;
                  loadMore(key, nextPage);
                }}
                hasLoadMore={hasLoadMore}
              />
            );
          })}
        </div>
      </div>

      {selectedMovieId && (
        <MovieDetailsModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          isInWatchlist={watchlistIds.has(selectedMovieId)}
          onWatchlistChange={refreshWatchlist}
        />
      )}

      {selectedTvId && (
        <TvDetailsModal
          tvId={selectedTvId}
          onClose={() => setSelectedTvId(null)}
        />
      )}
    </div>
  );
};

// ========== HERO BANNER ==========
const HeroBanner = ({ movie, mediaType, onPlayClick, onDetailsClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const rating = movie.vote_average || 0;
  const title = movie.title || movie.name || '';
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : null;
  const overview = movie.overview || '';
  const runtime = movie.runtime || 0;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '80vh', maxHeight: '95vh' }}>
      {backdropUrl && (
        <div className="absolute inset-0 z-0">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          <img
            src={backdropUrl}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { e.target.style.display = 'none'; setImgLoaded(true); }}
            style={{ objectPosition: 'center 20%' }}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-netflix-black/95 via-netflix-black/40 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-netflix-black/80 via-transparent to-transparent" />

      <div className="relative h-full min-h-[80vh] flex items-end pb-20 md:pb-32 px-4 md:px-16">
        <div className="max-w-2xl w-full animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            {rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                ★ <span className="text-white">{rating.toFixed(1)}</span>
              </span>
            )}
            {year && <span className="text-netflix-gray-light">{year}</span>}
            {runtime > 0 && (
              <span className="text-netflix-gray-light">{Math.floor(runtime / 60)}h {runtime % 60}m</span>
            )}
            <span className="badge-netflix">{mediaType === 'tv' ? 'SERIES' : 'MOVIE'}</span>
          </div>
          {overview && (
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 line-clamp-3 max-w-xl">
              {overview}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={onPlayClick} className="btn-play text-lg px-8 py-3">
              <Play className="w-6 h-6" fill="currentColor" /> Play
            </button>
            <button onClick={onDetailsClick} className="btn-more-info text-lg px-8 py-3">
              <Info className="w-6 h-6" /> More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== MOVIE/TV ROW ==========
const MovieRow = ({ title, movies, type, watchlistIds, onWatchlistChange, onDetailsClick, loadingMore, onLoadMore, hasLoadMore }) => {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkArrows);
      checkArrows();
      return () => el.removeEventListener('scroll', checkArrows);
    }
  }, [checkArrows, movies]);

  const scroll = useCallback((direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      // Check arrows after scroll animation
      setTimeout(checkArrows, 400);
    }
  }, [checkArrows]);

  if (!movies?.length) return null;

  return (
    <section className="px-4 md:px-16">
      <h2 className="section-header">{title}</h2>
      <div className="relative group/row">
        {/* Left scroll arrow - always present, visibility toggled */}
        <button
          onClick={() => scroll('left')}
          className={`absolute -left-1 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-black/50 hover:bg-black/80 transition-all duration-300 ${
            showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Movie cards carousel */}
        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-auto py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={`${movie.id}-${movie.title || movie.name}`} className="flex-shrink-0 w-[150px] md:w-[180px] lg:w-[200px]">
              <MovieCard
                movie={{ ...movie, media_type: type }}
                isInWatchlist={watchlistIds.has(movie.id)}
                onWatchlistChange={onWatchlistChange}
                onDetailsClick={onDetailsClick}
              />
            </div>
          ))}

          {/* Load More card */}
          {hasLoadMore && (
            <div className="flex-shrink-0 w-[150px] md:w-[180px] lg:w-[200px] flex items-center justify-center">
              {loadingMore ? (
                <div className="flex flex-col items-center gap-2 text-netflix-gray">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                <button
                  onClick={onLoadMore}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-netflix-gray hover:border-white text-netflix-gray-light hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                  title="Load more"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right scroll arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute -right-1 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-black/50 hover:bg-black/80 transition-all duration-300 ${
            showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </section>
  );
};

export default Home;