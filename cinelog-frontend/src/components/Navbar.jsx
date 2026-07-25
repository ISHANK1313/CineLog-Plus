import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Search' },
    { path: '/tv-series', label: 'TV Series' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-netflix-black shadow-xl'
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="px-4 md:px-16">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left section */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <span className="text-3xl md:text-4xl font-bold text-netflix-red tracking-tight">
                  CINELOG
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(path)
                        ? 'text-white font-bold'
                        : 'text-netflix-gray-light hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/watchlist"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive('/watchlist')
                        ? 'text-white font-bold'
                        : 'text-netflix-gray-light hover:text-white'
                    }`}
                  >
                    My Watchlist
                  </Link>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Search icon */}
              <button
                onClick={() => navigate('/search')}
                className="text-white hover:text-netflix-gray-light transition-colors"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Notifications bell */}
              <button className="text-white hover:text-netflix-gray-light transition-colors hidden md:block">
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {isAuthenticated ? (
                /* Profile dropdown (authenticated) */
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1 text-white hover:text-netflix-gray-light transition-colors"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-netflix-red rounded flex items-center justify-center text-xs md:text-sm font-bold">
                      {(user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 bg-black border border-netflix-dark-light rounded shadow-2xl z-20 w-48 py-2 animate-fade-in">
                        <div className="px-4 py-2 text-sm text-netflix-gray-light border-b border-netflix-dark-light truncate">
                          {user?.email || 'User'}
                        </div>
                        <Link
                          to="/watchlist"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-netflix-dark-hover transition-colors"
                        >
                          My Watchlist
                        </Link>
                        <Link
                          to="/search"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-netflix-dark-hover transition-colors"
                        >
                          Browse
                        </Link>
                        <hr className="border-netflix-dark-light my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-netflix-dark-hover transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Auth buttons (guest) */
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-white text-sm font-medium hover:text-netflix-gray-light transition-colors hidden md:block"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-netflix-red hover:bg-netflix-red-hover text-white text-sm font-semibold px-4 py-1.5 md:px-5 md:py-2 rounded transition-all duration-200"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col gap-1.5 p-1"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-netflix-black border-t border-netflix-dark-light animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-netflix-dark-hover text-white'
                      : 'text-netflix-gray-light hover:text-white hover:bg-netflix-dark-hover'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive('/watchlist')
                      ? 'bg-netflix-dark-hover text-white'
                      : 'text-netflix-gray-light hover:text-white hover:bg-netflix-dark-hover'
                  }`}
                >
                  My Watchlist
                </Link>
              )}
              <hr className="border-netflix-dark-light my-2" />
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-netflix-gray-light hover:text-white hover:bg-netflix-dark-hover rounded transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2 px-4 py-3">
                  <button
                    onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                    className="w-full py-2 text-sm font-medium text-white border border-netflix-dark-light rounded hover:bg-netflix-dark-hover transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="w-full py-2 text-sm font-semibold text-white bg-netflix-red rounded hover:bg-netflix-red-hover transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;