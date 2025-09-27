import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Users, Calendar, MapPin, DollarSign, Book, MessageSquare, Settings, BarChart3, Plus, CreditCard as Edit, Trash2, Eye, Search, Bell, LogOut, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Admin: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const adminRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication check (in real app, this would be server-side)
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('بيانات دخول خاطئة');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 },
    { id: 'meetings', label: 'الاجتماعات', labelEn: 'Meetings', icon: Calendar },
    { id: 'events', label: 'الفعاليات', labelEn: 'Events', icon: Calendar },
    { id: 'trips', label: 'الرحلات', labelEn: 'Trips', icon: MapPin },
    { id: 'donations', label: 'التبرعات', labelEn: 'Donations', icon: DollarSign },
    { id: 'confessions', label: 'الاعتراف', labelEn: 'Confessions', icon: MessageSquare },
    { id: 'users', label: 'المستخدمين', labelEn: 'Users', icon: Users },
    { id: 'bible', label: 'قراءة الكتاب', labelEn: 'Bible Reading', icon: Book },
    { id: 'settings', label: 'الإعدادات', labelEn: 'Settings', icon: Settings }
  ];

  const stats = [
    { title: 'إجمالي الأعضاء', titleEn: 'Total Members', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { title: 'الاجتماعات هذا الشهر', titleEn: 'Meetings This Month', value: '45', change: '+8%', color: 'bg-green-500' },
    { title: 'التبرعات هذا الشهر', titleEn: 'Donations This Month', value: '25,000 ج.م', change: '+15%', color: 'bg-yellow-500' },
    { title: 'الرحلات القادمة', titleEn: 'Upcoming Trips', value: '8', change: '+3%', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    if (!adminRef.current || !isAuthenticated) return;

    gsap.set('.admin-card', { opacity: 0, y: 30, scale: 0.95 });
    gsap.set('.stat-card', { opacity: 0, x: -30 });

    const tl = gsap.timeline();

    tl.to('.stat-card', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
    })
    .to('.admin-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.3');
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                لوحة التحكم
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                يرجى تسجيل الدخول للوصول إلى لوحة التحكم
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="admin123"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg
                         font-semibold transition-all duration-300 transform hover:scale-105"
              >
                تسجيل الدخول
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                <strong>للتجربة:</strong><br />
                المستخدم: admin<br />
                كلمة المرور: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {language === 'ar' ? stat.title : stat.titleEn}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الأنشطة الأخيرة</h3>
          <div className="space-y-3">
            {[
              { action: 'تم حجز موعد اعتراف جديد', time: 'منذ 5 دقائق', type: 'confession' },
              { action: 'تبرع جديد بقيمة 500 جنيه', time: 'منذ 15 دقيقة', type: 'donation' },
              { action: 'تسجيل عضو جديد', time: 'منذ ساعة', type: 'user' },
              { action: 'إضافة فعالية جديدة', time: 'منذ ساعتين', type: 'event' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">الإشعارات</h3>
          <div className="space-y-3">
            {[
              { message: '5 طلبات حجز رحلات جديدة', priority: 'high' },
              { message: 'موعد اعتراف يحتاج تأكيد', priority: 'medium' },
              { message: 'تحديث بيانات عضو', priority: 'low' },
              { message: 'رسالة جديدة من صفحة الاتصال', priority: 'high' }
            ].map((notification, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Bell className={`h-4 w-4 ${
                  notification.priority === 'high' ? 'text-red-500' :
                  notification.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                <p className="text-sm text-gray-900 dark:text-white flex-1">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'meetings':
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الاجتماعات</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="h-4 w-4" />
                <span>إضافة اجتماع</span>
              </button>
            </div>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">قسم إدارة الاجتماعات قيد التطوير</p>
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الفعاليات</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="h-4 w-4" />
                <span>إضافة فعالية</span>
              </button>
            </div>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">قسم إدارة الفعاليات قيد التطوير</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">هذا القسم قيد التطوير</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={adminRef} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{language === 'ar' ? item.label : item.labelEn}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg
                     text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                className="pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;