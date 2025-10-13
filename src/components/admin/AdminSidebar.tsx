import React, { useState } from 'react';
import { 
  X, ChevronRight, Search, TrendingUp, Clock, Zap, Activity, 
  Users, Calendar, MapPin, DollarSign, Book, MessageSquare, Settings, BarChart3, 
  Bell, Shield, Star, Save, Home, Sparkles, CreditCard,
  ChevronDown, Target, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
  icon: any;
  badge?: string;
  count?: number;
  description: string;
  descriptionEn: string;
}

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
  onLogout: () => void;
  loggingOut: boolean;
  currentUserEmail?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  expandedGroups,
  toggleGroup,
  onLogout,
  loggingOut,
  currentUserEmail
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [quickAccessVisible, setQuickAccessVisible] = useState(true);

  // Smart menu organization with badges and priorities
  const menuGroups: {
    id: string;
    label: string;
    labelEn: string;
    priority: string;
    color: string;
    icon?: any;
    items: MenuItem[];
  }[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      labelEn: 'Overview',
      priority: 'high',
      color: 'from-blue-500 to-indigo-600',
      items: [
        { 
          id: 'dashboard', 
          label: 'لوحة التحكم', 
          labelEn: 'Dashboard', 
          icon: Home, 
          badge: 'main',
          description: 'نظرة شاملة على النظام',
          descriptionEn: 'Complete system overview'
        }
      ]
    },
    {
      id: 'management',
      label: 'إدارة المحتوى',
      labelEn: 'Content Management',
      icon: Calendar,
      priority: 'high',
      color: 'from-green-500 to-emerald-600',
      items: [
        { 
          id: 'meetings', 
          label: 'الاجتماعات', 
          labelEn: 'Meetings', 
          icon: Calendar,
          badge: 'active',
          description: 'إدارة الاجتماعات والأنشطة',
          descriptionEn: 'Manage meetings and activities'
        },
        { 
          id: 'events', 
          label: 'الفعاليات', 
          labelEn: 'Events', 
          icon: Star,
          description: 'تنظيم الفعاليات الخاصة',
          descriptionEn: 'Organize special events'
        },
        { 
          id: 'trips', 
          label: 'الرحلات', 
          labelEn: 'Trips', 
          icon: MapPin,
          description: 'تخطيط وإدارة الرحلات',
          descriptionEn: 'Plan and manage trips'
        },
        {
          id: 'trips-payments',
          label: 'مدفوعات الرحلات',
          labelEn: 'Trips Payments',
          icon: CreditCard,
          badge: 'new',
          description: 'عرض مدفوعات الرحلات',
          descriptionEn: 'View trips payments'
        }
      ]
    },
    {
      id: 'communication',
      label: 'التواصل والخدمات',
      labelEn: 'Communication & Services',
      icon: MessageSquare,
      priority: 'medium',
      color: 'from-purple-500 to-pink-600',
      items: [
        { 
          id: 'confessions', 
          label: 'الاعتراف', 
          labelEn: 'Confessions', 
          icon: MessageSquare,
          badge: 'new',
          description: 'خدمة الاعتراف الرقمية',
          descriptionEn: 'Digital confession service'
        },
        { 
          id: 'contact', 
          label: 'رسائل التواصل', 
          labelEn: 'Contact Messages', 
          icon: MessageSquare,
          badge: 'urgent',
          description: 'إدارة رسائل المستخدمين',
          descriptionEn: 'Manage user messages'
        },
        { 
          id: 'donations', 
          label: 'صناديق التبرعات', 
          labelEn: 'Donation Boxes', 
          icon: DollarSign,
          badge: 'trending',
          description: 'إدارة أنواع وصناديق التبرعات',
          descriptionEn: 'Manage donation types and boxes'
        },
        { 
          id: 'donation-transactions', 
          label: 'معاملات التبرعات', 
          labelEn: 'Donation Transactions', 
          icon: CreditCard,
          badge: 'new',
          description: 'إدارة تبرعات المستخدمين',
          descriptionEn: 'Manage user donations'
        }
      ]
    },
    {
      id: 'Services',
      label: 'الخدمات فى الكنيسة',
      labelEn: 'Services in Church',
      icon: BarChart3,
      priority: 'high',
      color: 'from-orange-500 to-red-600',
      items: [
        { 
          id: 'Elementary', 
          label: 'خدمة المرحلة الأبتدائية', 
          labelEn: 'Elementary Service', 
          icon: Users,
          badge: 'growing',
          description: 'إدارة خدمة المرحلة الأبتدائية',
          descriptionEn: 'Manage service for Elementary stage'
        },
        { 
          id: 'Preparatory', 
          label: 'خدمة المرحلة الاعدادية', 
          labelEn: 'Preparatory Service', 
          icon: Users,
          badge: 'growing',
          description: 'إدارة خدمة المرحلة الأعدادية',
          descriptionEn: 'Manage service for Preparatory stage'
        },
        { 
          id: 'Secondary', 
          label: 'خدمة المرحلة الثانوية', 
          labelEn: 'Secondary Service', 
          icon: Users,
          badge: 'growing',
          description: 'إدارة خدمة المرحلة الثانوية',
          descriptionEn: 'Manage service for Secondary stage'
        },
        { 
          id: 'University', 
          label: 'خدمة جامعة', 
          labelEn: 'university Service', 
          icon: Users,
          badge: 'growing',
          description: 'إدارة خدمة جامعة',
          descriptionEn: 'Manage service for university stage'
        },
        { 
          id: 'Missing', 
          label: 'الأفتقاد', 
          labelEn: 'Missing Service', 
          icon: Users,
          badge: 'growing',
          description: 'إدارة خدمة الأفتقاد',
          descriptionEn: 'Manage service for Missing'
        },
      ]
    },
    {
      id: 'analytics',
      label: 'البيانات والتحليل',
      labelEn: 'Analytics & Insights',
      icon: BarChart3,
      priority: 'medium',
      color: 'from-orange-500 to-red-600',
      items: [
        { 
          id: 'users', 
          label: 'المستخدمين', 
          labelEn: 'Users', 
          icon: Users,
          count: 1247,
          badge: 'growing',
          description: 'إدارة حسابات المستخدمين',
          descriptionEn: 'Manage user accounts'
        },
        { 
          id: 'reports', 
          label: 'التقارير', 
          labelEn: 'Reports', 
          icon: BarChart3,
          description: 'تقارير مفصلة ومخصصة',
          descriptionEn: 'Detailed custom reports'
        },
        { 
          id: 'analytics', 
          label: 'الإحصائيات', 
          labelEn: 'Analytics', 
          icon: TrendingUp,
          badge: 'insights',
          description: 'تحليلات متقدمة للبيانات',
          descriptionEn: 'Advanced data analytics'
        }
      ]
    },
    {
      id: 'system',
      label: 'إدارة النظام',
      labelEn: 'System Management',
      icon: Settings,
      priority: 'low',
      color: 'from-gray-500 to-slate-600',
      items: [
        { 
          id: 'settings', 
          label: 'الإعدادات', 
          labelEn: 'Settings', 
          icon: Settings,
          description: 'إعدادات النظام العامة',
          descriptionEn: 'General system settings'
        },
        { 
          id: 'security', 
          label: 'الأمان', 
          labelEn: 'Security', 
          icon: Shield,
          badge: 'important',
          description: 'إعدادات الأمان والحماية',
          descriptionEn: 'Security and protection settings'
        },
        { 
          id: 'firestore-test', 
          label: 'اختبار Firestore', 
          labelEn: 'Firestore Test', 
          icon: Activity,
          badge: 'debug',
          description: 'اختبار الاتصال بقاعدة البيانات',
          descriptionEn: 'Test database connection'
        },
        { 
          id: 'notifications', 
          label: 'الإشعارات', 
          labelEn: 'Notifications', 
          icon: Bell,
          count: 7,
          description: 'إدارة إشعارات النظام',
          descriptionEn: 'Manage system notifications'
        },
        { 
          id: 'backup', 
          label: 'النسخ الاحتياطي', 
          labelEn: 'Backup', 
          icon: Save,
          description: 'النسخ الاحتياطي واستعادة البيانات',
          descriptionEn: 'Backup and data recovery'
        }
      ]
    }
  ];

  // Quick access items based on recent activity
  const quickAccessItems = [
    { id: 'dashboard', icon: Home, label: 'الرئيسية', labelEn: 'Home' },
    { id: 'contact', icon: MessageSquare, label: 'الرسائل', labelEn: 'Messages', count: 15 },
    { id: 'events', icon: Star, label: 'الفعاليات', labelEn: 'Events' },
    { id: 'users', icon: Users, label: 'المستخدمين', labelEn: 'Users' }
  ];

  // Filter menu items based on search
  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      searchQuery === '' || 
      (language === 'ar' ? item.label : item.labelEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (language === 'ar' ? item.description : item.descriptionEn).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  // Badge component
  const Badge = ({ type, count, children }: { type?: string; count?: number; children?: React.ReactNode }) => {
    const badges = {
      'main': 'bg-blue-500 text-white',
      'active': 'bg-green-500 text-white',
      'new': 'bg-purple-500 text-white animate-pulse',
      'urgent': 'bg-red-500 text-white animate-bounce',
      'trending': 'bg-orange-500 text-white',
      'growing': 'bg-emerald-500 text-white',
      'insights': 'bg-indigo-500 text-white',
      'important': 'bg-yellow-500 text-black',
      'featured': 'bg-pink-500 text-white'
    };

    if (count) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[20px] h-5">
          {count > 99 ? '99+' : count}
        </span>
      );
    }

    if (type && badges[type as keyof typeof badges]) {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges]}`}>
          {children || type}
        </span>
      );
    }

    return null;
  };

  const handleItemClick = (itemId: string) => {
    setActiveTab(itemId);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Smart Enhanced Sidebar */}
      <div className={`admin-sidebar fixed lg:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 
                      w-80 min-w-80 max-w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                      shadow-2xl border-r border-gray-200/20 dark:border-gray-700/20
                      flex flex-col overflow-hidden
                      transform transition-all duration-500 ease-out
                      ${sidebarOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}
                      ${language === 'ar' && !sidebarOpen ? 'translate-x-full lg:translate-x-0' : ''}`}
      >
        {/* Modern Header with Glassmorphism */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>
          
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {language === 'ar' ? 'لوحة التحكم الذكية' : 'Smart Admin Panel'}
                  </h2>
                  <p className="text-blue-100 text-sm opacity-90">
                    {language === 'ar' ? 'نظام إدارة متطور' : 'Advanced Management System'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Smart Search Bar */}
            <div className="relative">
              <div className={`flex items-center bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 
                            transition-all duration-300 ${isSearchFocused ? 'bg-white/20 scale-105' : ''}`}>
                <Search className="h-4 w-4 text-white/70 ml-3 rtl:mr-3 rtl:ml-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={language === 'ar' ? 'البحث في القوائم...' : 'Search menus...'}
                  className="flex-1 bg-transparent text-white placeholder-white/60 px-3 py-2.5 focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-2 rtl:ml-2 rtl:mr-0 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Panel */}
        {quickAccessVisible && searchQuery === '' && (
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {language === 'ar' ? 'وصول سريع' : 'Quick Access'}
              </span>
              <button
                onClick={() => setQuickAccessVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickAccessItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`relative p-2 rounded-lg text-center transition-all duration-200 hover:scale-105
                            ${activeTab === item.id 
                              ? 'bg-blue-500 text-white shadow-lg' 
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                            }`}
                >
                  <item.icon className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-xs font-medium block truncate">
                    {language === 'ar' ? item.label : item.labelEn}
                  </span>
                  {item.count && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.count > 9 ? '9+' : item.count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <div className="flex-1 overflow-y-auto admin-sidebar-scroll px-2 py-4 space-y-2">
          {(searchQuery ? filteredGroups : menuGroups).map((group) => (
            <div key={group.id} className="space-y-1">
              {/* Smart Group Header */}
              {group.items.length > 1 ? (
                <div className="relative px-2">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`menu-item w-full flex items-center justify-between px-4 py-3 text-sm font-semibold 
                               text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400
                               rounded-xl transition-all duration-300 group relative overflow-hidden
                               hover:bg-gradient-to-r ${group.color} hover:text-white hover:shadow-lg hover:scale-[1.02]`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex items-center space-x-3 rtl:space-x-reverse relative z-10">
                      {group.icon && <group.icon className="h-5 w-5" />}
                      <span>{language === 'ar' ? group.label : group.labelEn}</span>
                      <div className={`h-2 w-2 rounded-full ${
                        group.priority === 'high' ? 'bg-red-400' : 
                        group.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform duration-300 relative z-10 ${
                        expandedGroups[group.id] ? 'rotate-90' : ''
                      } ${language === 'ar' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                </div>
              ) : null}

              {/* Smart Menu Items */}
              <div className={`${group.items.length > 1 ? `overflow-hidden transition-all duration-500 ease-out ${
                expandedGroups[group.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }` : ''}`}>
                {group.items.map((item) => (
                  <div key={item.id} className={`relative ${group.items.length > 1 ? 'mx-4' : ''}`}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`menu-item w-full flex items-center justify-between px-4 py-2 my-2
                                text-sm font-medium rounded-xl transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                transform hover:scale-[1.02] group relative overflow-hidden
                                ${activeTab === item.id
                                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-xl scale-[1.02]'
                                  : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:shadow-md'
                                }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse relative z-10">
                        <div className="relative">
                          <item.icon className={`h-5 w-5 transition-colors duration-300 ${
                            activeTab === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
                          }`} />
                          {item.badge && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="truncate">{language === 'ar' ? item.label : item.labelEn}</span>
                            {item.badge && <Badge type={item.badge} />}
                          </div>
                          <p className={`text-xs truncate ${
                            activeTab === item.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {language === 'ar' ? item.description : item.descriptionEn}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse relative z-10">
                        {'count' in item && item.count && <Badge count={item.count} />}
                        {activeTab === item.id && (
                          <div className="flex space-x-1 rtl:space-x-reverse">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State for Search */}
          {searchQuery && filteredGroups.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'ar' ? 'جرب كلمات مفتاحية أخرى' : 'Try different keywords'}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm space-y-3">
          {/* Performance Indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Activity className="h-3 w-3 text-green-500" />
              <span>{language === 'ar' ? 'النظام يعمل بكفاءة' : 'System performing well'}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{language === 'ar' ? 'متصل' : 'Online'}</span>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {currentUserEmail?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {language === 'ar' ? 'مدير النظام' : 'System Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUserEmail}
                </p>
              </div>
            </div>
            
            
          </div>
          
          {/* Enhanced Logout Button */}
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl
                     bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                     text-white font-medium shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                     transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loggingOut ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{language === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...'}</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
              </>
            )}
          </button>
        </div>
      </div>


    </>
  );
};

export default AdminSidebar;