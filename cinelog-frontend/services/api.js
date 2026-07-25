import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ====== AUTH ======
export const authAPI = {
  signup: async (email, password) => {
    try {
      const response = await api.post('/api/auth/signup', { email, password });
      return { success: true, message: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Signup failed. Please try again.',
      };
    }
  },
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return { success: true, token: response.data.token };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Invalid email or password',
      };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};

// ====== EMBED URL GENERATORS ======
export const EMBED_SOURCES = [
  {
    name: 'multiembed',
    movieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    tvUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    name: 'autoembed',
    movieUrl: (tmdbId) => `https://player.autoembed.app/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId, season, episode) => `https://player.autoembed.app/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    name: 'vidsrc',
    movieUrl: (tmdbId) => `https://vidsrc.sbs/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId, season, episode) => `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}`,
  },
];

export const getEmbedUrls = (mediaType, tmdbId, season = 1, episode = 1) => {
  return EMBED_SOURCES.map(source => ({
    name: source.name,
    url: mediaType === 'tv'
      ? source.tvUrl(tmdbId, season, episode)
      : source.movieUrl(tmdbId),
  }));
};

// ====== MOVIES ======
export const movieAPI = {
  searchMovies: async (query, page = 1, includeAdult = false) => {
    try {
      const response = await api.get('/api/movies', {
        params: { query, page, include_adult: includeAdult, language: 'en-US' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to search movies' };
    }
  },
  searchMulti: async (query, page = 1, includeAdult = false) => {
    try {
      const response = await api.get('/api/search/multi', {
        params: { query, page, include_adult: includeAdult, language: 'en-US' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to search' };
    }
  },
  getTrendingMovies: async (language = 'en-US') => {
    try {
      const response = await api.get('/api/trending', { params: { language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch trending movies' };
    }
  },
  getPopularMovies: async (page = 1, language = 'en-US') => {
    try {
      const response = await api.get('/api/popular', { params: { page, language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch popular movies' };
    }
  },
  getMovieDetails: async (movieId, language = 'en-US') => {
    try {
      const response = await api.get(`/api/movie/${movieId}`, { params: { language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch movie details' };
    }
  },
  fetchEmbedUrl: async (imdbId) => {
    try {
      const response = await api.get(`/api/movie/embed/${imdbId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch embed URL' };
    }
  },
};

// ====== TV SHOWS ======
export const tvAPI = {
  getTrendingTv: async (language = 'en-US') => {
    try {
      const response = await api.get('/api/tv/trending', { params: { language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch trending TV' };
    }
  },
  getPopularTv: async (page = 1, language = 'en-US') => {
    try {
      const response = await api.get('/api/tv/popular', { params: { page, language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch popular TV' };
    }
  },
  getTvDetails: async (tvId, language = 'en-US') => {
    try {
      const response = await api.get(`/api/tv/${tvId}`, { params: { language } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch TV details' };
    }
  },
  searchTv: async (query, page = 1, includeAdult = false) => {
    try {
      const response = await api.get('/api/tv/search', {
        params: { query, page, include_adult: includeAdult, language: 'en-US' },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to search TV shows' };
    }
  },
};

// ====== WATCHLIST ======
export const watchlistAPI = {
  getWatchlist: async () => {
    try {
      const response = await api.get('/watchlist');
      return { success: true, data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to fetch watchlist', data: [] };
    }
  },
  addToWatchlist: async (movie) => {
    try {
      const payload = {
        tmdbMovieId: movie.id,
        title: movie.title || movie.name,
        overview: movie.overview,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || movie.first_air_date,
      };
      const response = await api.post('/watchlist', payload);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data || 'Failed to add to watchlist';
      return { success: false, message: typeof message === 'string' ? message : 'Failed to add to watchlist' };
    }
  },
  removeFromWatchlist: async (tmdbMovieId) => {
    try {
      const response = await api.delete(`/watchlist/${tmdbMovieId}`);
      return { success: true, message: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || 'Failed to remove from watchlist' };
    }
  },
};

export default api;