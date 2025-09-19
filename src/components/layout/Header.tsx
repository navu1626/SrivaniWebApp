import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Menu, X, Home, Gamepad2, Trophy, Info, ChevronDown, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';


const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Measure header height and set CSS variable so pages can offset dynamically
  useEffect(() => {
    let rafId: number | null = null;
    const setHeaderHeight = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = headerRef.current?.getBoundingClientRect();
        const h = rect ? Math.ceil(rect.height) : 0;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      });
    };

    setHeaderHeight();
    const ro = new ResizeObserver(() => setHeaderHeight());
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', setHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setHeaderHeight);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/religious-games', label: 'Religious Games', icon: Gamepad2 },
    { to: '/results', label: 'Results', icon: Trophy },
    { to: '/about', label: 'About Us', icon: Info },
  ];

  return (
    <>
  <header ref={(el) => (headerRef.current = el)} className="fixed top-0 left-0 right-0 z-[99999] bg-gradient-to-r from-maroon-900 via-saffron-800 to-maroon-900 shadow-2xl border-b-4 border-gold-400/50 backdrop-blur-sm">
      {/* Animated background pattern (decorative - should not block interactions) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
      </div>

      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="p-1 rounded-full shadow-xl group-hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-saffron-500 to-gold-500">
                  <div className="bg-white/95 p-1 rounded-full">
                    <div className="w-8 h-8 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none -z-10"></div>
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-bold text-white drop-shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                {t('app.title')}
              </motion.h1>
              <motion.p
                className="hidden md:block text-gold-200 text-sm font-medium opacity-90"
                whileHover={{ scale: 1.01 }}
              >
                {t('app.subtitle')}
              </motion.p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5 ml-[100px]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.to}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium group"
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-md p-0.5 border border-white/20">
                <motion.button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  EN
                </motion.button>
                <motion.button
                  onClick={() => setLanguage('hi')}
                  className={`ml-1 px-2 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                    language === 'hi'
                      ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  हिं
                </motion.button>
              </div>
            </motion.div>

            {/* Auth Navigation */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl transition-all duration-300 text-white font-medium border border-white/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user.firstName || 'User'}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2 z-[99999]"
                      >
                        {isAdmin ? (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-maroon-700 hover:bg-saffron-50 transition-colors"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span>{t('common.dashboard')}</span>
                            </Link>
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-maroon-700 hover:bg-saffron-50 transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              <span>{t('common.admin')}</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-maroon-700 hover:bg-saffron-50 transition-colors"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>{t('common.dashboard')}</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-maroon-700 hover:bg-saffron-50 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <hr className="my-2 border-cream-200" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t('common.logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-xl transition-all duration-300 text-white font-medium border border-white/20"
                  >
                    {t('common.login')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 px-6 py-2 rounded-xl transition-all duration-300 text-white font-semibold shadow-lg"
                  >
                    {t('common.register')}
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                {/* Mobile Navigation */}
                <nav className="space-y-2 mb-4">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile Auth */}
                {user ? (
                  <div className="space-y-2">
                    {isAdmin ? (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                          >
                            <BarChart3 className="h-5 w-5" />
                            <span>{t('common.dashboard')}</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                          >
                            <Settings className="h-5 w-5" />
                            <span>{t('common.admin')}</span>
                          </Link>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                        >
                          <BarChart3 className="h-5 w-5" />
                          <span>{t('common.dashboard')}</span>
                        </Link>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-red-500/20 transition-all duration-300 font-medium w-full text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('common.logout')}</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span>{t('common.login')}</span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 hover:from-saffron-600 hover:to-gold-600 transition-all duration-300 text-white font-semibold"
                      >
                        <User className="h-5 w-5" />
                        <span>{t('common.register')}</span>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </header>
    </>
  );
};

export default Header;