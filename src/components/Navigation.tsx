import Darkmood from './DarkmoodBtm';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut, auth } from '../services/firebase';
import LoginButton from './LoginButton';
import logo from '../../public/Images/logo.jpg'

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, t } = useLanguage();
  const { currentUser, appUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home after logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'meetings', href: '/meetings' },
    { key: 'events', href: '/events' },
    { key: 'trips', href: '/trips' },
    { key: 'donations', href: '/donations' },
    { key: 'confession', href: '/confession' },
    { key: 'contact', href: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isOpen
      ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-md shadow-lg'
      : 'bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 min-h-[3.5rem]">
          {/* Logo */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">

            <div className="hidden sm:block">
              <Link to="/" className="focus:outline-none">
                <img src={logo} alt="Church Logo Text" className="h-14 rounded-lg" />

              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`text-black dark:text-gray-300 hover:text-red-700 dark:hover:text-blue-400 
                        transition-all duration-200 font-medium focus:outline-none text-sm lg:text-base
                        px-2 py-1 rounded-md hover:bg-white/20 dark:hover:bg-gray-800/20  hover:border-white/30 dark:hover:border-gray-700/30 ${location.pathname === item.href ? 'text-red-700 dark:text-red-400 font-bold bg-white/20 dark:bg-red-900/20 border-white/30 dark:border-red-700/30' : ''
                  }`}
              >
                {t(item.key)}
              </Link>

            ))}
            <div className="m-5">
              <Darkmood />
            </div>
            {/* Auth Button */}
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {/* Show admin link only for admin role. For service role ('خادم') route to services dashboard. */}
                  {appUser?.role === 'admin' ? (
                    <Link
                      to="/admin"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-4 py-2 rounded-lg 
                            transition-all duration-200 font-medium focus:outline-none text-sm lg:text-base
                            shadow-md hover:shadow-lg border border-green-600 hover:border-green-700"
                    >
                      {language === 'ar' ? 'لوحة التحكم' : 'Admin'}
                    </Link>
                  ) : appUser?.role === 'خادم' ? (
                    <Link
                      to="/services-dashboard"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-4 py-2 rounded-lg 
                            transition-all duration-200 font-medium focus:outline-none text-sm lg:text-base
                            shadow-md hover:shadow-lg border border-green-600 hover:border-green-700"
                    >
                      {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg 
                          transition-all duration-200 focus:outline-none
                          shadow-md hover:shadow-lg border border-red-600 hover:border-red-700"
                    title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

              </>

            ) : (
              <Link to="/login" className="focus:outline-none">
                <LoginButton />
              </Link>
              // <Link
              //   to="/login"
              //   className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg 
              //           transition-all duration-200 font-medium focus:outline-none text-sm lg:text-base
              //           shadow-md hover:shadow-lg border border-blue-600 hover:border-blue-700"
              // >
              //   {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              // </Link>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse flex-shrink-0">
            {/* Language Switcher */}
            {/* <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center space-x-1 rtl:space-x-reverse px-2 sm:px-3 py-1 sm:py-2 rounded-lg
                      bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                      transition-colors duration-200 focus:outline-none focus:ring-0"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {language === 'ar' ? 'EN' : 'العربية'}
              </span>
            </button> */}

            {/* Theme Toggle */}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm
                      hover:bg-white/30 dark:hover:bg-gray-700/30 focus:outline-none focus:ring-0 border border-white/20 dark:border-gray-700/20"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Sidebar */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Sidebar Menu */}
            <div className={`md:hidden fixed text-center top-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl border-r border-white/20 dark:border-gray-700/20 z-50 transition-all duration-800 ease-in-out  !overflow-x-hidden ${isOpen ? 'h-full translate-x-0' : 'h-0 -translate-x-full'}
              `} style={{ height: isOpen ? '100vh' : '0', overflowX: 'hidden' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/20 bg-white">
                <div className="flex items-center justify-center flex-grow">
                  <Link to="/" className="focus:outline-none">
                    <img src={logo} alt="Church Logo Text" className="h-20 rounded-lg" />
                  </Link>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm transition-colors border border-transparent hover:border-white/30 dark:hover:border-gray-700/30"
                >
                  <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2 bg-white">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300
                            hover:bg-white/20 dark:hover:bg-gray-800/20 backdrop-blur-sm transition-all duration-200 focus:outline-none 
                            text-base font-medium border-l-4 border border-transparent hover:border-white/30 dark:hover:border-gray-700/30 ${location.pathname === item.href
                        ? 'bg-white/20 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold border-red-500 border-white/30 dark:border-red-700/30'
                        : 'border-transparent hover:border-l-white/50 dark:hover:border-l-gray-600/50'
                      }`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
                <div className="flex justify-center items-center !mb-5 !mt-5">
                  <Darkmood />
                </div>
                {/* Mobile Auth Buttons */}
                {currentUser ? (
                  <div className="space-y-2">
                    {appUser?.role === 'admin' ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white
                                transition-all duration-200 focus:outline-none text-base font-medium
                                text-center shadow-md hover:shadow-lg border border-green-600 hover:border-green-700"
                      >
                        {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                      </Link>
                    ) : appUser?.role === 'خادم' ? (
                      <Link
                        to="/services-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white
                                transition-all duration-200 focus:outline-none text-base font-medium
                                text-center shadow-md hover:shadow-lg border border-green-600 hover:border-green-700"
                      >
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                    ) : null}
                    <>
                      <button
                        onClick={async () => {
                          // Close menu first
                          setIsOpen(false);
                          try {
                            await signOut(auth);
                            navigate('/', { replace: true });
                          } catch (error) {
                            console.error('Logout error:', error);
                          }
                        }}
                        className="block w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white
                              transition-all duration-200 focus:outline-none text-base font-medium
                              text-center shadow-md hover:shadow-lg border border-red-600 hover:border-red-700"
                      >
                        {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                      </button>

                    </>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Link to="/login" className="focus:outline-none">
                      <LoginButton />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;