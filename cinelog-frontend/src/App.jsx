import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Watchlist from '../pages/Watchlist';
import TvSeries from '../pages/TvSeries';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-netflix-black text-white">
          <Navbar />
          <AuthModal />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/tv-series" element={<TvSeries />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;