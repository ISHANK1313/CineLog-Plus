import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { tvAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../src/components/MovieCard';
import TvDetailsModal from '../src/components/TvDetailsModal';
import Loading from '../src/components/Loading';
import ErrorMessage from '../src/components/ErrorMessage';

const TvSeries = () => {
  const [rows, setRows] = useState({});
  const [rowPages, setRowPages] = useState({ trendingTv: 1, popularTv: 1, topRated: 1 });
  const [loadingMore, setLoadingMore] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTvId, setSelectedTvId] = useState(null);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trendingRes, popularRes] = await Promise.all([
        tvAPI.getTrendingTv(),
        tvAPI.getPopularTv(1),
      ]);

      const newRows = {};
      if (trendingRes.success && trendingRes.data?.results?.length) {
        newRows.trendingTv = trendingRes.data.results;
      }
      if (popularRes.success && popularRes.data?.results?.length) {
        const sorted = popularRes.data.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        newRows.popularTv = sorted;
        newRows.topRated = sorted.slice().sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      setRows(newRows);

      if (isAuthenticated) {
        const watchlistRes = await watchlistAPI.getWatchlist();
        if (watchlistRes.success) {
          setWatchlistIds(new Set(watchlistRes.data.map((item) => item.tmdbMovieId)));
        }
      }
    } catch (err) {
      setError('Failed to load TV shows.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async (sectionKey, page) => {
    setLoadingMore(prev => ({ ...prev, [sectionKey]: true }));
    try {
      const result = await tvAPI.getPopularTv(page);
      if (result.success && result.data?.results?.length) {
        const items = sectionKey === 'topRated'
          ? result.data.results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
          : result.data.results;
        setRows(prev => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), ...items] }));
        setRowPages(prev => ({ ...prev, [sectionKey]: page }));
      }
    } catch (err) {
      setError('Failed to load more.');
    } finally {
      setLoadingMore(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  if (loading) return <Loading fullScreen />;

  const SECTIONS = [
    { key: 'trendingTv', label: 'Trending TV Series', loadMore: false },
    { key: 'popularTv', label: 'Popular TV Series', loadMore: true },
    { key: 'topRated', label: 'Top Rated TV Series', loadMore: true },
  ];

  return (
    <div className="bg-netflix-black min-h-screen pt-20 md:pt-24">
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <ErrorMessage message={error} onClose={() => setError('')} />
        </div>
      )}
      <div className="pb-32">
        <div className="px-4 md:px-16 mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold">TV Series</h1>
          <p className="text-netflix-gray-light mt-2">Browse popular and trending TV shows</p>
        </div>
        <div className="space-y-8 md:space-y-12">
          {SECTIONS.map(({ key, label, loadMore: hasLoadMore }) => {
            const shows = rows[key];
            if (!shows?.length) return null;
            return (
              <TvRow
                key={key}
                title={label}
                shows={shows}
                watchlistIds={watchlistIds}
                onWatchlistChange={() => {}}
                onDetailsClick={(tv) => setSelectedTvId(tv.id)}
                loadingMore={loadingMore[key]}
                onLoadMore={() => loadMore(key, (rowPages[key] || 1) + 1)}
                hasLoadMore={hasLoadMore}
              />
            );
          })}
        </div>
      </div>
      {selectedTvId && <TvDetailsModal tvId={selectedTvId} onClose={() => setSelectedTvId(null)} />}
    </div>
  );
};

const TvRow = ({ title, shows, onDetailsClick, loadingMore, onLoadMore, hasLoadMore }) => {
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
  }, [checkArrows, shows]);

  const scroll = (direction) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: direction === 'left' ? -rowRef.current.clientWidth * 0.75 : rowRef.current.clientWidth * 0.75, behavior: 'smooth' });
      setTimeout(checkArrows, 400);
    }
  };

  return (
    <section className="px-4 md:px-16">
      <h2 className="section-header">{title}</h2>
      <div className="relative group/row">
        <button onClick={() => scroll('left')} className={`absolute -left-1 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-black/50 hover:bg-black/80 transition-all duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-label="Scroll left">
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <div ref={rowRef} className="flex gap-2 overflow-x-auto py-2 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {shows.map((show) => (
            <div key={`${show.id}-${show.name}`} className="flex-shrink-0 w-[150px] md:w-[180px] lg:w-[200px]">
              <MovieCard movie={{ ...show, media_type: 'tv' }} onDetailsClick={onDetailsClick} />
            </div>
          ))}
          {hasLoadMore && (
            <div className="flex-shrink-0 w-[150px] md:w-[180px] lg:w-[200px] flex items-center justify-center">
              {loadingMore ? (
                <div className="flex flex-col items-center gap-2 text-netflix-gray"><Loader2 className="w-8 h-8 animate-spin" /><span className="text-sm">Loading...</span></div>
              ) : (
                <button onClick={onLoadMore} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-netflix-gray hover:border-white text-netflix-gray-light hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>
          )}
        </div>
        <button onClick={() => scroll('right')} className={`absolute -right-1 top-0 bottom-0 z-20 w-12 md:w-16 flex items-center justify-center bg-black/50 hover:bg-black/80 transition-all duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-label="Scroll right">
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </section>
  );
};

export default TvSeries;