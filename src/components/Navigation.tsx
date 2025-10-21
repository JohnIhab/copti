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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // 🔹 تمت الإضافة
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
    <>
      {/* 🔹 نافذة تأكيد تسجيل الخروج */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-[90%] max-w-sm text-center border border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {language === 'ar' ? 'هل أنت متأكد أنك تريد تسجيل الخروج؟' : 'Are you sure you want to log out?'}
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                {language === 'ar' ? 'نعم، تسجيل الخروج' : 'Yes, Logout'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition-all duration-200"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 شريط التنقل */}
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
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
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

                  {/* 🔹 استدعاء الـ Popup هنا */}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg 
                            transition-all duration-200 focus:outline-none
                            shadow-md hover:shadow-lg border border-red-600 hover:border-red-700"
                    title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="focus:outline-none">
                  <LoginButton />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm
                      hover:bg-white/30 dark:hover:bg-gray-700/30 focus:outline-none focus:ring-0 border border-white/20 dark:border-gray-700/20"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
