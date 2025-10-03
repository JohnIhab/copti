import React, { useState } from 'react';
import { Menu, Search, Bell, Shield, BarChart3, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminTopbarProps {
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUserEmail?: string;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({
  activeTab,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  currentUserEmail
}) => {
  const { language } = useLanguage();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 },
    { id: 'meetings', label: 'الاجتماعات', labelEn: 'Meetings', icon: Users },
    { id: 'events', label: 'الفعاليات', labelEn: 'Events', icon: Sparkles },
    { id: 'trips', label: 'الرحلات', labelEn: 'Trips', icon: TrendingUp },
    { id: 'confessions', label: 'الاعتراف', labelEn: 'Confessions', icon: Shield },
    { id: 'contact', label: 'رسائل التواصل', labelEn: 'Contact Messages', icon: Bell },
    { id: 'notifications', label: 'الإشعارات', labelEn: 'Notifications', icon: Bell },
    { id: 'users', label: 'المستخدمين', labelEn: 'Users', icon: Users },
    { id: 'reports', label: 'التقارير', labelEn: 'Reports', icon: BarChart3 },
    { id: 'analytics', label: 'الإحصائيات', labelEn: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'الإعدادات', labelEn: 'Settings', icon: Shield },
    { id: 'security', label: 'الأمان', labelEn: 'Security', icon: Shield },
    { id: 'permissions', label: 'الصلاحيات', labelEn: 'Permissions', icon: Shield },
    { id: 'backup', label: 'النسخ الاحتياطي', labelEn: 'Backup', icon: Shield },
    { id: 'donations', label: 'التبرعات', labelEn: 'Donations', icon: Zap },
    { id: 'bible', label: 'قراءة الكتاب', labelEn: 'Bible Reading', icon: Shield }
  ];

  const currentMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="admin-topbar bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl border-b border-gray-200/30 dark:border-gray-700/30 h-20 flex items-center justify-between px-8 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-purple-50/30 to-indigo-50/40 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:from-transparent dark:via-gray-800/20 dark:to-transparent"></div>
      
      <div className="relative flex items-center space-x-6 rtl:space-x-reverse z-10">
        {/* Smart Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg group"
        >
          <Menu className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
        </button>

        {/* Page Title with Icon */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {currentMenuItem && (
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
              <currentMenuItem.icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentMenuItem ? (language === 'ar' ? currentMenuItem.label : currentMenuItem.labelEn) : 'Admin Panel'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'إدارة وتحكم متقدم' : 'Advanced Management & Control'}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Actions */}
      <div className="relative flex items-center space-x-4 rtl:space-x-reverse z-10">
        {/* Smart Search Bar */}
        <div className={`relative transition-all duration-500 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
          <div className={`flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
            isSearchFocused 
              ? 'border-blue-300 dark:border-blue-600 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50' 
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }`}>
            <Search className={`h-5 w-5 ml-4 rtl:mr-4 rtl:ml-0 transition-colors duration-300 ${
              isSearchFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={language === 'ar' ? 'البحث في لوحة التحكم...' : 'Search admin panel...'}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Smart Notifications */}
        <div className="relative">
          <button className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </div>

        {/* Performance Indicator */}
        <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-2xl border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            {language === 'ar' ? 'أداء ممتاز' : 'Excellent'}
          </span>
        </div>

        {/* User Profile */}
        <div className="relative group">
          <button className="flex items-center space-x-3 rtl:space-x-reverse p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {currentUserEmail?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden lg:block text-left rtl:text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {language === 'ar' ? 'مدير النظام' : 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
                {currentUserEmail}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;