import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, Clock, AlertCircle, Play } from 'lucide-react';
import { tvAPI } from '../../services/api';
import EmbedPlayer from './EmbedPlayer';
import Loading from './Loading';

const TvDetailsModal = ({ tvId, onClose }) => {
  const [tvShow, setTvShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await tvAPI.getTvDetails(tvId);
        if (result.success) {
          setTvShow(result.data);
          const firstSeason = result.data.seasons?.find(s => s.season_number > 0)?.season_number || 1;
          setSelectedSeason(firstSeason);
        } else {
          setError(result.message || 'Failed to load TV show details');
        }
      } catch (err) {
        setError('Unable to load TV show details.');
      } finally {
        setLoading(false);
      }
    };
    if (tvId) fetchDetails();
  }, [tvId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-black rounded-lg p-8 max-w-4xl w-full"><Loading /></div>
      </div>
    );
  }

  if (error && !tvShow) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-dark rounded-lg p-6 max-w-md w-full border border-netflix-dark-light">
          <div className="flex items-center mb-4 text-netflix-red">
            <AlertCircle className="w-5 h-5 mr-2" /><h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-netflix-gray-light mb-6">{error}</p>
          <button onClick={onClose} className="btn-netflix w-full">Close</button>
        </div>
      </div>
    );
  }

  if (!tvShow) return null;

  const posterUrl = tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : null;
  const backdropUrl = tvShow.backdrop_path ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}` : null;
  const genres = tvShow.genres?.map(g => g.name).join(' · ') || '';
  const seasons = tvShow.seasons?.filter(s => s.season_number > 0) || [];
  const episodeCount = Array.from({ length: Math.min(tvShow.number_of_episodes || 12, 24) }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-netflix-black rounded-lg max-w-5xl w-full my-8 md:my-16 animate-scale-in border border-netflix-dark-light overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {backdropUrl && (
          <div className="relative h-56 md:h-80">
            <img src={backdropUrl} alt={tvShow.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {showPlayer && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Now Playing: {tvShow.name}</h3>
              <EmbedPlayer mediaType="tv" tmdbId={tvShow.id} season={selectedSeason} episode={selectedEpisode} title={tvShow.name} />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-48">
              {posterUrl && <img src={posterUrl} alt={tvShow.name} className="rounded-lg shadow-2xl w-full" onError={(e) => { e.target.style.display = 'none'; }} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{tvShow.name}</h2>
              {tvShow.tagline && <p className="text-netflix-gray italic mb-3">"{tvShow.tagline}"</p>}

              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                {tvShow.vote_average > 0 && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded font-semibold">
                    <Star className="w-4 h-4" fill="currentColor" /> {tvShow.vote_average.toFixed(1)}
                  </span>
                )}
                {tvShow.first_air_date && (
                  <span className="flex items-center gap-1 text-netflix-gray-light">
                    <Calendar className="w-4 h-4" /> {new Date(tvShow.first_air_date).getFullYear()}
                  </span>
                )}
                {tvShow.number_of_seasons > 0 && (
                  <span className="flex items-center gap-1 text-netflix-gray-light">
                    <Clock className="w-4 h-4" /> {tvShow.number_of_seasons} Seasons
                  </span>
                )}
                {genres && <span className="text-netflix-gray-light">{genres}</span>}
              </div>

              {tvShow.overview && <p className="text-white/80 leading-relaxed mb-6">{tvShow.overview}</p>}

              {/* Play button & Episode selector */}
              <div className="mb-6">
                {!showPlayer ? (
                  <button onClick={() => setShowPlayer(true)} className="btn-play text-lg px-6 py-2.5 mb-4">
                    <Play className="w-5 h-5" fill="currentColor" /> Start Watching
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3 mb-4 p-4 bg-netflix-dark rounded-lg border border-netflix-dark-light">
                    <div>
                      <label className="block text-xs text-netflix-gray mb-1">Season</label>
                      <select value={selectedSeason} onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1); }} className="input-netflix text-sm py-1.5 px-3 w-28">
                        {seasons.map(s => (
                          <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-netflix-gray mb-1">Episode</label>
                      <select value={selectedEpisode} onChange={(e) => setSelectedEpisode(Number(e.target.value))} className="input-netflix text-sm py-1.5 px-3 w-28">
                        {Array.from({ length: Math.min(tvShow.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 12, 24) }, (_, i) => i + 1).map(ep => (
                          <option key={ep} value={ep}>Episode {ep}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-netflix-dark rounded-lg border border-netflix-dark-light">
                {tvShow.number_of_seasons > 0 && <div><p className="text-netflix-gray text-xs mb-1">Seasons</p><p className="font-semibold">{tvShow.number_of_seasons}</p></div>}
                {tvShow.number_of_episodes > 0 && <div><p className="text-netflix-gray text-xs mb-1">Episodes</p><p className="font-semibold">{tvShow.number_of_episodes}</p></div>}
                {tvShow.status && <div><p className="text-netflix-gray text-xs mb-1">Status</p><p className="font-semibold">{tvShow.status}</p></div>}
                {tvShow.original_language && <div><p className="text-netflix-gray text-xs mb-1">Language</p><p className="font-semibold uppercase">{tvShow.original_language}</p></div>}
              </div>

              {tvShow.networks?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-netflix-dark-light">
                  <p className="text-netflix-gray text-xs mb-2">Networks</p>
                  <div className="flex flex-wrap gap-2">
                    {tvShow.networks.map(n => <span key={n.id} className="px-3 py-1 bg-netflix-dark-light rounded text-sm">{n.name}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvDetailsModal;