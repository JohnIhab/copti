import React from 'react';
import { Church, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/aboutpage' },
    { key: 'meetings', href: '/meetings' },
    { key: 'events', href: '/events' },
    { key: 'contact', href: '/contact' },
    { key: 'terms', href: '/terms-and-conditions', label: 'الشروط و الأحكام' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100064731461327', color: 'hover:text-blue-600' },
    // { icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    // { icon: Youtube, href: '#', color: 'hover:text-red-600' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <Church className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold">{t('heroTitle')}</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('footerDescription')}
            </p>
            
            <div className="space-y-3">
              <Link to="https://www.google.com/maps/search/?api=1&query=30.5143667,31.3321065" className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 hover:text-blue-400 transition-colors duration-200 focus:outline-none">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span>كفر فرج جرجس،منيا القمح، محافظة الشرقية، مصر</span>
              </div>
              </Link>
              <Link to="tel:+201205002001" className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 hover:text-green-400 transition-colors duration-200 focus:outline-none">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span dir="ltr">+201205002001</span>
              </div>
              </Link>
              <Link to="mailto:johnihab.01@gmail.com" className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 hover:text-red-400 transition-colors duration-200 focus:outline-none">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <Mail className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span dir="ltr">johnihab.01@gmail.com</span>
              </div>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-red-500 transition-colors duration-200 focus:outline-none"
                  >
                    {link.label ? link.label : t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t('followUs')}</h4>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-3 bg-gray-800 rounded-full ${social.color} 
                           transition-all duration-300 transform hover:scale-110`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            
            <div className="mt-6">
              <h5 className="font-semibold mb-3">أوقات الخدمة</h5>
              <div className="text-gray-300 text-sm space-y-1">
                <p>القداس : 7:00 ص</p>
                <p>اجتماع الشباب: الخميس 7:00 م</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center relative">
          <p className="text-gray-400">
            © 2025 {t('heroTitle')}. {t('rightsReserved')}
          </p>
          
          {/* Hidden Admin Access */}
          <Link
            to="/admin"
            className="absolute left-4 -bottom-4 group"
            title="Admin Access"
          >
            <div className="relative p-5 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 
                          opacity-20 hover:opacity-80 transition-all duration-500 ease-in-out
                          hover:bg-gray-700/70 hover:border-gray-600/70 hover:shadow-lg hover:shadow-blue-500/20
                          transform hover:scale-110 active:scale-95">
              <Lock className="h-4 w-4 text-white group-hover:text-blue-400 transition-colors duration-300" />
              
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300 blur-sm"></div>
              
              {/* Pulse animation on hover */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 opacity-0 
                            group-hover:opacity-100 group-hover:animate-ping"></div>
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;