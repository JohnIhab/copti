import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Users, Calendar, MapPin, DollarSign, Book, MessageSquare, Settings, BarChart3, 
  Plus, Bell, Menu, X, LogOut, Shield, Heart, Clock, Star,
  Eye, Edit, Trash2, Search, Download, Save, Mail, Phone,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMeetings } from '../contexts/MeetingsContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut, auth } from '../services/firebase';

gsap.registerPlugin(ScrollTrigger);

interface Event {
  id: number;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  locationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  featured: boolean;
}

interface Trip {
  id: number;
  title: string;
  titleEn: string;
  destination: string;
  destinationEn: string;
  date: string;
  duration: string;
  durationEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  capacity: number;
  registered: number;
  cost: number;
}

interface DonationType {
  key: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: string;
  amount: number;
  target: number;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const { meetings, addMeeting, deleteMeeting, loading, error } = useMeetings();
  
  // Core admin state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Meeting management state
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    titleEn: '',
    subtitle: '',
    subtitleEn: '',
    time: '',
    day: '',
    dayEn: '',
    location: '',
    locationEn: '',
    category: 'youth',
    categoryEn: 'Youth',
    capacity: 50
  });
  
  // Events management state
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'مؤتمر الشباب السنوي',
      titleEn: 'Annual Youth Conference',
      date: '2025-02-15',
      time: '9:00 AM',
      location: 'قاعة المؤتمرات الكبرى',
      locationEn: 'Grand Conference Hall',
      category: 'conference',
      categoryEn: 'Conference',
      description: 'مؤتمر روحي للشباب مع متحدثين مميزين وأنشطة تفاعلية',
      descriptionEn: 'Spiritual conference for youth with distinguished speakers and interactive activities',
      image: '/Images/events/youth-conference.jpg',
      capacity: 200,
      registered: 150,
      featured: true
    }
  ]);
  
  // Trips management state
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 1,
      title: 'رحلة دير الأنبا بيشوي',
      titleEn: 'St. Bishoy Monastery Trip',
      destination: 'وادي النطرون',
      destinationEn: 'Wadi El Natrun',
      date: '2025-02-20',
      duration: 'يوم واحد',
      durationEn: 'One Day',
      category: 'adults',
      categoryEn: 'Adults',
      description: 'رحلة روحية لدير الأنبا بيشوي العامر بوادي النطرون',
      descriptionEn: 'Spiritual trip to St. Bishoy Monastery in Wadi El Natrun',
      image: '/Images/trips/monastery-trip.jpg',
      capacity: 50,
      registered: 35,
      cost: 300
    }
  ]);
  
  // Donations management state
  const [donations, setDonations] = useState<DonationType[]>([
    {
      key: 'general',
      title: 'تبرع عام',
      titleEn: 'General Donation',
      description: 'للمساهمة في أنشطة الكنيسة العامة',
      descriptionEn: 'To contribute to general church activities',
      color: 'bg-red-500',
      amount: 15000,
      target: 50000
    },
    {
      key: 'building',
      title: 'صندوق البناء',
      titleEn: 'Building Fund',
      description: 'للمساهمة في مشاريع البناء والتطوير',
      descriptionEn: 'To contribute to building and development projects',
      color: 'bg-blue-500',
      amount: 75000,
      target: 200000
    }
  ]);
  
  const adminRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (loggingOut) return;
    
    const confirmed = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد من تسجيل الخروج من لوحة التحكم؟'
        : 'Are you sure you want to logout from the admin panel?'
    );
    
    if (!confirmed) return;
    
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      alert(
        language === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.'
          : 'An error occurred during logout. Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const newMeeting = {
        ...meetingForm,
        description: meetingForm.subtitle,
        descriptionEn: meetingForm.subtitleEn
      };
      
      await addMeeting(newMeeting);
      
      // Reset form
      setMeetingForm({
        title: '',
        titleEn: '',
        subtitle: '',
        subtitleEn: '',
        time: '',
        day: '',
        dayEn: '',
        location: '',
        locationEn: '',
        category: 'youth',
        categoryEn: 'Youth',
        capacity: 50
      });
      
      setShowMeetingForm(false);
    } catch (error) {
      console.error('Error adding meeting:', error);
      // You could add a toast notification here
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الاجتماع؟' : 'Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id);
      } catch (error) {
        console.error('Error deleting meeting:', error);
        // You could add a toast notification here
      }
    }
  };

  const categories = [
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' },
    { key: 'ladies', label: 'السيدات', labelEn: 'Ladies' },
    { key: 'men', label: 'الرجال', labelEn: 'Men' },
    { key: 'general', label: 'عام', labelEn: 'General' }
  ];

  const days = [
    { key: 'sunday', label: 'الأحد', labelEn: 'Sunday' },
    { key: 'monday', label: 'الاثنين', labelEn: 'Monday' },
    { key: 'tuesday', label: 'الثلاثاء', labelEn: 'Tuesday' },
    { key: 'wednesday', label: 'الأربعاء', labelEn: 'Wednesday' },
    { key: 'thursday', label: 'الخميس', labelEn: 'Thursday' },
    { key: 'friday', label: 'الجمعة', labelEn: 'Friday' },
    { key: 'saturday', label: 'السبت', labelEn: 'Saturday' }
  ];

  const menuGroups = [
    {
      id: 'main',
      label: 'الرئيسية',
      labelEn: 'Main',
      items: [
        { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 }
      ]
    },
    {
      id: 'management',
      label: 'إدارة المحتوى',
      labelEn: 'Content Management',
      icon: Calendar,
      items: [
        { id: 'meetings', label: 'الاجتماعات', labelEn: 'Meetings', icon: Calendar },
        { id: 'events', label: 'الفعاليات', labelEn: 'Events', icon: Star },
        { id: 'trips', label: 'الرحلات', labelEn: 'Trips', icon: MapPin }
      ]
    },
    {
      id: 'communication',
      label: 'التواصل',
      labelEn: 'Communication',
      icon: MessageSquare,
      items: [
        { id: 'confessions', label: 'الاعتراف', labelEn: 'Confessions', icon: MessageSquare },
        { id: 'contact', label: 'رسائل التواصل', labelEn: 'Contact Messages', icon: Mail },
        { id: 'notifications', label: 'الإشعارات', labelEn: 'Notifications', icon: Bell }
      ]
    },
    {
      id: 'analytics',
      label: 'البيانات والتحليل',
      labelEn: 'Data & Analytics',
      icon: BarChart3,
      items: [
        { id: 'users', label: 'المستخدمين', labelEn: 'Users', icon: Users },
        { id: 'reports', label: 'التقارير', labelEn: 'Reports', icon: BarChart3 },
        { id: 'analytics', label: 'الإحصائيات', labelEn: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      id: 'system',
      label: 'النظام',
      labelEn: 'System',
      icon: Settings,
      items: [
        { id: 'settings', label: 'الإعدادات', labelEn: 'Settings', icon: Settings },
        { id: 'security', label: 'الأمان', labelEn: 'Security', icon: Shield },
        { id: 'permissions', label: 'الصلاحيات', labelEn: 'Permissions', icon: Shield },
        { id: 'backup', label: 'النسخ الاحتياطي', labelEn: 'Backup', icon: Save }
      ]
    },
    {
      id: 'other',
      label: 'أخرى',
      labelEn: 'Other',
      items: [
        { id: 'donations', label: 'التبرعات', labelEn: 'Donations', icon: DollarSign },
        { id: 'bible', label: 'قراءة الكتاب', labelEn: 'Bible Reading', icon: Book }
      ]
    }
  ];

  // Get all menu items flattened for compatibility
  const menuItems = menuGroups.flatMap(group => group.items);

  // Initialize expanded groups on mount
  useEffect(() => {
    setExpandedGroups({
      'management': true,
      'communication': false,
      'analytics': false,
      'system': false,
      'other': false
    });
  }, []);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const stats = [
    { title: 'إجمالي الأعضاء', titleEn: 'Total Members', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { title: 'الاجتماعات هذا الشهر', titleEn: 'Meetings This Month', value: '45', change: '+8%', color: 'bg-green-500' },
    { title: 'التبرعات هذا الشهر', titleEn: 'Donations This Month', value: '25,000 ج.م', change: '+15%', color: 'bg-yellow-500' },
    { title: 'الرحلات القادمة', titleEn: 'Upcoming Trips', value: '8', change: '+3%', color: 'bg-purple-500' }
  ];

  // Enhanced GSAP animations
  useEffect(() => {
    if (!adminRef.current) return;

    // Initial page load animation
    const tl = gsap.timeline();

    // Reset elements
    gsap.set('.admin-sidebar', { x: language === 'ar' ? 100 : -100, opacity: 0 });
    gsap.set('.admin-topbar', { y: -50, opacity: 0 });
    gsap.set('.admin-card', { opacity: 0, y: 50, scale: 0.9, rotationX: 15 });
    gsap.set('.stat-card', { opacity: 0, x: -50, scale: 0.8 });
    gsap.set('.menu-item', { opacity: 0, x: language === 'ar' ? 30 : -30 });
    gsap.set('.content-header', { opacity: 0, y: -30 });

    // Add scroll event listener for sidebar navigation
    const navElement = document.querySelector('.admin-sidebar-scroll');
    if (navElement) {
      navElement.addEventListener('scroll', () => {
        // Smooth scroll behavior is handled by CSS
        // This could be used for additional scroll-based animations if needed
      });
    }

    // Animate in sequence
    tl.to('.admin-sidebar', {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    })
    .to('.admin-topbar', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4')
    .to('.menu-item', {
      opacity: 1,
      x: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    .to('.content-header', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.2')
    .to('.stat-card', {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    .to('.admin-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out'
    }, '-=0.4');

    // Hover animations for cards
    const cards = document.querySelectorAll('.admin-card, .stat-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          y: -5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    // Cleanup
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, [language]);

  // Tab transition animations
  useEffect(() => {
    const contentElements = document.querySelectorAll('.tab-content > *');
    
    gsap.fromTo(contentElements, 
      { opacity: 0, y: 30, rotationX: 15 },
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      }
    );
  }, [activeTab]);

  // Floating animation for action buttons
  useEffect(() => {
    const floatingElements = document.querySelectorAll('.floating-btn');
    
    floatingElements.forEach((element, index) => {
      gsap.to(element, {
        y: -10,
        duration: 2 + (index * 0.2),
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    });
  }, []);

  // Sidebar animation on toggle
  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
    
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        x: open ? 0 : (language === 'ar' ? 100 : -100),
        opacity: open ? 1 : 0,
        duration: 0.4,
        ease: 'power3.out'
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 tab-content">
      {/* Enhanced Header */}
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Main Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'مرحباً بك في نظام إدارة الكنيسة المتقدم' : 'Welcome to the advanced church management system'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'إضافة جديد' : 'Add New'}</span>
            </button>
            <button className="floating-btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Download className="h-4 w-4" />
              <span>{language === 'ar' ? 'تصدير' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-6 translate-x-6"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">
                  {language === 'ar' ? stat.title : stat.titleEn}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{stat.change}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'هذا الشهر' : 'this month'}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-4 rounded-2xl shadow-lg`}>
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="admin-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-6">
            {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="space-y-3">
            {[
              { label: language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting', icon: Calendar, color: 'bg-blue-500', action: () => setActiveTab('meetings') },
              { label: language === 'ar' ? 'إضافة فعالية' : 'Add Event', icon: Star, color: 'bg-green-500', action: () => setActiveTab('events') },
              { label: language === 'ar' ? 'إضافة رحلة' : 'Add Trip', icon: MapPin, color: 'bg-purple-500', action: () => setActiveTab('trips') },
              { label: language === 'ar' ? 'إدارة التبرعات' : 'Manage Donations', icon: Heart, color: 'bg-red-500', action: () => setActiveTab('donations') }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <div className={`${action.color} p-2 rounded-lg`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'الأنشطة الأخيرة' : 'Recent Activities'}
            </h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { 
                action: language === 'ar' ? 'تم حجز موعد اعتراف جديد' : 'New confession appointment booked', 
                time: language === 'ar' ? 'منذ 5 دقائق' : '5 minutes ago', 
                type: 'confession',
                icon: MessageSquare,
                color: 'bg-blue-500'
              },
              { 
                action: language === 'ar' ? 'تبرع جديد بقيمة 500 جنيه' : 'New donation of 500 EGP', 
                time: language === 'ar' ? 'منذ 15 دقيقة' : '15 minutes ago', 
                type: 'donation',
                icon: DollarSign,
                color: 'bg-green-500'
              },
              { 
                action: language === 'ar' ? 'تسجيل عضو جديد' : 'New member registration', 
                time: language === 'ar' ? 'منذ ساعة' : '1 hour ago', 
                type: 'user',
                icon: Users,
                color: 'bg-purple-500'
              },
              { 
                action: language === 'ar' ? 'إضافة فعالية جديدة' : 'New event added', 
                time: language === 'ar' ? 'منذ ساعتين' : '2 hours ago', 
                type: 'event',
                icon: Calendar,
                color: 'bg-orange-500'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className={`${activity.color} p-2 rounded-full`}>
                  <activity.icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="admin-card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 shadow-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
              {language === 'ar' ? 'الإشعارات المهمة' : 'Important Notifications'}
            </h3>
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full">
              4
            </span>
          </div>
          <div className="space-y-4">
            {[
              { message: language === 'ar' ? '5 طلبات حجز رحلات جديدة' : '5 new trip booking requests', priority: 'high', icon: MapPin },
              { message: language === 'ar' ? 'موعد اعتراف يحتاج تأكيد' : 'Confession appointment needs confirmation', priority: 'medium', icon: Clock },
              { message: language === 'ar' ? 'تحديث بيانات عضو' : 'Member data update', priority: 'low', icon: Users },
              { message: language === 'ar' ? 'رسالة جديدة من صفحة الاتصال' : 'New message from contact page', priority: 'high', icon: MessageSquare }
            ].map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 rtl:space-x-reverse p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                <div className={`p-2 rounded-full ${
                  notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/50' :
                  notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-green-100 dark:bg-green-900/50'
                }`}>
                  <notification.icon className={`h-3 w-3 ${
                    notification.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                    notification.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 rtl:ml-2 rtl:mr-0 ${
                      notification.priority === 'high' ? 'bg-red-500' :
                      notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {notification.priority} {language === 'ar' ? 'أولوية' : 'priority'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Events Management Render
  const renderEvents = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة الفعاليات' : 'Events Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة وتنظيم جميع فعاليات الكنيسة' : 'Manage and organize all church events'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="admin-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img 
                src={event.image} 
                alt={language === 'ar' ? event.title : event.titleEn}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/Images/hero.jpg';
                }}
              />
              {event.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? event.title : event.titleEn}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {language === 'ar' ? event.description : event.descriptionEn}
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{event.date} - {event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? event.location : event.locationEn}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{event.registered}/{event.capacity} {language === 'ar' ? 'مشارك' : 'participants'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {language === 'ar' ? event.category : event.categoryEn}
                </span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Trips Management Render
  const renderTrips = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة الرحلات' : 'Trips Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'تنظيم وإدارة الرحلات الروحية والترفيهية' : 'Organize and manage spiritual and recreational trips'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة رحلة جديدة' : 'Add New Trip'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="admin-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <img 
                src={trip.image} 
                alt={language === 'ar' ? trip.title : trip.titleEn}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/Images/hero.jpg';
                }}
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {trip.cost} {language === 'ar' ? 'ج.م' : 'EGP'}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? trip.title : trip.titleEn}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {language === 'ar' ? trip.description : trip.descriptionEn}
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? trip.destination : trip.destinationEn}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{trip.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{language === 'ar' ? trip.duration : trip.durationEn}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  <span>{trip.registered}/{trip.capacity} {language === 'ar' ? 'مشارك' : 'participants'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                  {language === 'ar' ? trip.category : trip.categoryEn}
                </span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Donations Management Render
  const renderDonations = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة التبرعات' : 'Donations Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'متابعة وإدارة جميع التبرعات والصناديق' : 'Track and manage all donations and funds'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة صندوق جديد' : 'Add New Fund'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {donations.map((donation) => {
          const percentage = (donation.amount / donation.target) * 100;
          return (
            <div key={donation.key} className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? donation.title : donation.titleEn}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {language === 'ar' ? donation.description : donation.descriptionEn}
                  </p>
                </div>
                <div className={`${donation.color} p-3 rounded-xl`}>
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? 'المبلغ المحصل' : 'Amount Raised'}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {donation.amount.toLocaleString()} / {donation.target.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`${donation.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {percentage.toFixed(1)}% {language === 'ar' ? 'مكتمل' : 'completed'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? 'المطلوب:' : 'Target:'} {(donation.target - donation.amount).toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div className="flex space-x-2 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <Eye className="h-4 w-4" />
                    <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                  </button>
                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Contact Messages Management Render
  const renderContact = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة الرسائل الواردة من صفحة التواصل' : 'Manage incoming messages from contact page'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              12 {language === 'ar' ? 'رسالة جديدة' : 'new messages'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali'}
                  </h3>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    {language === 'ar' ? 'جديد' : 'New'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>ahmed.mohamed@email.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>+20 1234567890</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    <span>{language === 'ar' ? 'منذ ساعتين' : '2 hours ago'}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'استفسار عن مواعيد الاجتماعات' : 'Inquiry about meeting schedules'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {language === 'ar' 
                    ? 'السلام عليكم، أود الاستفسار عن مواعيد اجتماعات الشباب والأنشطة المتاحة...'
                    : 'Peace be upon you, I would like to inquire about youth meeting schedules and available activities...'
                  }
                </p>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Confessions Management Render  
  const renderConfessions = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة الاعتراف' : 'Confessions Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة مواعيد الاعتراف والحجوزات' : 'Manage confession appointments and bookings'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة موعد' : 'Add Appointment'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'مريم يوسف' : 'Mariam Youssef'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? 'الخميس 15 فبراير' : 'Thursday, Feb 15'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                index % 3 === 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                index % 3 === 1 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                {index % 3 === 0 ? (language === 'ar' ? 'مؤكد' : 'Confirmed') :
                 index % 3 === 1 ? (language === 'ar' ? 'معلق' : 'Pending') :
                 (language === 'ar' ? 'جديد' : 'New')}
              </span>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                <span>{10 + index}:00 AM - {11 + index}:00 AM</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                <span>+20 123456789{index}</span>
              </div>
            </div>

            <div className="flex space-x-2 rtl:space-x-reverse mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                {language === 'ar' ? 'تأكيد' : 'Confirm'}
              </button>
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                {language === 'ar' ? 'تأجيل' : 'Reschedule'}
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Users Management Render
  const renderUsers = () => (
    <div className="space-y-8 tab-content">
      <div className="content-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'إدارة حسابات المستخدمين والصلاحيات' : 'Manage user accounts and permissions'}
            </p>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 lg:mt-0">
            <button className="floating-btn bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse shadow-lg">
              <Plus className="h-5 w-5" />
              <span>{language === 'ar' ? 'إضافة مستخدم' : 'Add User'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
              {language === 'ar' ? 'قائمة المستخدمين' : 'Users List'}
            </h3>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث عن مستخدم...' : 'Search users...'}
                  className="bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none w-32"
                />
              </div>
              <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
                <option>{language === 'ar' ? 'جميع الأدوار' : 'All Roles'}</option>
                <option>{language === 'ar' ? 'مدير' : 'Admin'}</option>
                <option>{language === 'ar' ? 'خادم' : 'Servant'}</option>
                <option>{language === 'ar' ? 'عضو' : 'Member'}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'المستخدم' : 'User'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'تاريخ التسجيل' : 'Join Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 8 }, (_, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {language === 'ar' ? 'أ' : 'A'}
                        </span>
                      </div>
                      <div className="ml-4 rtl:mr-4 rtl:ml-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {language === 'ar' ? `أحمد محمد ${index + 1}` : `Ahmed Mohamed ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ahmed.mohamed{index + 1}@email.com
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      index === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      index === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {index === 0 ? (language === 'ar' ? 'مدير' : 'Admin') :
                       index === 1 ? (language === 'ar' ? 'خادم' : 'Servant') :
                       (language === 'ar' ? 'عضو' : 'Member')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    2024-{(index % 12) + 1 < 10 ? '0' + ((index % 12) + 1) : (index % 12) + 1}-{(index % 28) + 1 < 10 ? '0' + ((index % 28) + 1) : (index % 28) + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      index % 3 === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {index % 3 === 0 ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'events':
        return renderEvents();
      case 'trips':
        return renderTrips();
      case 'donations':
        return renderDonations();
      case 'confessions':
        return renderConfessions();
      case 'users':
        return renderUsers();
      case 'bible':
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 tab-content">
            <div className="text-center py-12">
              <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'قراءة الكتاب المقدس' : 'Bible Reading'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'هذا القسم قيد التطوير' : 'This section is under development'}
              </p>
            </div>
          </div>
        );
      case 'contact':
        return renderContact();
      case 'reports':
      case 'analytics':
      case 'notifications':
      case 'backup':
      case 'security':
      case 'permissions':
      case 'settings':
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 tab-content">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? menuItems.find(item => item.id === activeTab)?.label : menuItems.find(item => item.id === activeTab)?.labelEn}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'هذا القسم قيد التطوير' : 'This section is under development'}
              </p>
            </div>
          </div>
        );
      case 'meetings':
        return (
          <div className="space-y-6">
            <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'إدارة الاجتماعات' : 'Meetings Management'}
                </h2>
                <button 
                  onClick={() => setShowMeetingForm(!showMeetingForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting'}</span>
                </button>
              </div>

              {/* Meeting Form */}
              {showMeetingForm && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {language === 'ar' ? 'إضافة اجتماع جديد' : 'Add New Meeting'}
                  </h3>
                  <form onSubmit={handleMeetingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={meetingForm.title}
                          onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'أدخل عنوان الاجتماع' : 'Enter meeting title'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={meetingForm.titleEn}
                          onChange={(e) => setMeetingForm({...meetingForm, titleEn: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter meeting title in English"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={meetingForm.subtitle}
                          onChange={(e) => setMeetingForm({...meetingForm, subtitle: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'أدخل وصفاً مختصراً' : 'Enter short description'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}
                        </label>
                        <input
                          type="text"
                          value={meetingForm.subtitleEn}
                          onChange={(e) => setMeetingForm({...meetingForm, subtitleEn: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter short description in English"
                        />
                      </div>

                      {/* Day */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'اليوم' : 'Day'}
                        </label>
                        <select
                          required
                          value={meetingForm.day}
                          onChange={(e) => {
                            const selectedDay = days.find(d => d.label === e.target.value || d.labelEn === e.target.value);
                            setMeetingForm({
                              ...meetingForm, 
                              day: selectedDay?.label || e.target.value,
                              dayEn: selectedDay?.labelEn || e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">{language === 'ar' ? 'اختر اليوم' : 'Select Day'}</option>
                          {days.map((day) => (
                            <option key={day.key} value={language === 'ar' ? day.label : day.labelEn}>
                              {language === 'ar' ? day.label : day.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'الوقت' : 'Time'}
                        </label>
                        <input
                          type="text"
                          required
                          value={meetingForm.time}
                          onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'مثال: 10:00 AM' : 'Example: 10:00 AM'}
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'المكان (عربي)' : 'Location (Arabic)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={meetingForm.location}
                          onChange={(e) => setMeetingForm({...meetingForm, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'أدخل مكان الاجتماع' : 'Enter meeting location'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'المكان (إنجليزي)' : 'Location (English)'}
                        </label>
                        <input
                          type="text"
                          required
                          value={meetingForm.locationEn}
                          onChange={(e) => setMeetingForm({...meetingForm, locationEn: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter meeting location in English"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'الفئة' : 'Category'}
                        </label>
                        <select
                          required
                          value={meetingForm.category}
                          onChange={(e) => {
                            const selectedCategory = categories.find(c => c.key === e.target.value);
                            setMeetingForm({
                              ...meetingForm, 
                              category: selectedCategory?.key || e.target.value,
                              categoryEn: selectedCategory?.labelEn || e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map((category) => (
                            <option key={category.key} value={category.key}>
                              {language === 'ar' ? category.label : category.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Capacity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'عدد المقاعد' : 'Capacity'}
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={meetingForm.capacity}
                          onChange={(e) => setMeetingForm({...meetingForm, capacity: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={language === 'ar' ? 'أدخل عدد المقاعد' : 'Enter capacity'}
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
                      <button
                        type="button"
                        onClick={() => setShowMeetingForm(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{submitting ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : (language === 'ar' ? 'إضافة الاجتماع' : 'Add Meeting')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Meetings List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الاجتماعات الحالية' : 'Current Meetings'}
                </h3>
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {language === 'ar' ? 'حدث خطأ في تحميل الاجتماعات' : 'Error loading meetings'}
                    </p>
                  </div>
                )}
                
                {/* Loading State */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">
                      {language === 'ar' ? 'جاري تحميل الاجتماعات...' : 'Loading meetings...'}
                    </p>
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'لا توجد اجتماعات حالياً' : 'No meetings available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {language === 'ar' ? meeting.title : meeting.titleEn}
                            </h4>
                            {meeting.subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {language === 'ar' ? meeting.subtitle : meeting.subtitleEn}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title={language === 'ar' ? 'حذف الاجتماع' : 'Delete Meeting'}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Calendar className="h-4 w-4" />
                            <span>{language === 'ar' ? meeting.day : meeting.dayEn} - {meeting.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <MapPin className="h-4 w-4" />
                            <span>{language === 'ar' ? meeting.location : meeting.locationEn}</span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Users className="h-4 w-4" />
                            <span>{meeting.registered}/{meeting.capacity} {language === 'ar' ? 'مشارك' : 'participants'}</span>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                              {language === 'ar' ? categories.find(c => c.key === meeting.category)?.label : categories.find(c => c.key === meeting.category)?.labelEn}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'events':
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إدارة الفعاليات' : 'Events Management'}
              </h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse">
                <Plus className="h-4 w-4" />
                <span>{language === 'ar' ? 'إضافة فعالية' : 'Add Event'}</span>
              </button>
            </div>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'قسم إدارة الفعاليات قيد التطوير' : 'Events management section under development'}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'هذا القسم قيد التطوير' : 'This section is under development'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={adminRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div 
        ref={sidebarRef}
        className={`admin-sidebar fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        {/* Enhanced Header */}
        <div className="relative h-20 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 flex items-center justify-between flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-blue-700/90 backdrop-blur-sm"></div>
          <div className="relative flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
              </h1>
              <p className="text-white/80 text-xs">
                {language === 'ar' ? 'نظام الإدارة المتقدم' : 'Advanced Management'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden relative p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Scroll Fade Indicators */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/95 via-white/60 to-transparent dark:from-gray-800/95 dark:via-gray-800/60 dark:to-transparent pointer-events-none z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/95 via-white/60 to-transparent dark:from-gray-800/95 dark:via-gray-800/60 dark:to-transparent pointer-events-none z-10"></div>
          
          {/* Enhanced Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto admin-sidebar-scroll relative">
            {/* Top padding for scroll indicator */}
            <div className="h-2"></div>
            
            {menuGroups.map((group, groupIndex) => (
              <div key={group.id} className="menu-group" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                {/* Single item groups (like dashboard) render directly */}
                {group.items.length === 1 ? (
                  <button
                    key={group.items[0].id}
                    onClick={() => {
                      setActiveTab(group.items[0].id);
                      setSidebarOpen(false);
                    }}
                    className={`menu-item w-full group flex items-center space-x-4 rtl:space-x-reverse px-4 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                      activeTab === group.items[0].id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === group.items[0].id
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      {React.createElement(group.items[0].icon, {
                        className: `h-5 w-5 transition-colors ${
                          activeTab === group.items[0].id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                        }`
                      })}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`font-medium transition-colors ${
                        activeTab === group.items[0].id ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {language === 'ar' ? group.items[0].label : group.items[0].labelEn}
                      </span>
                    </div>
                    {activeTab === group.items[0].id && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                ) : (
                    /* Multi-item groups render as collapsible dropdowns */
                  <div className="space-y-1">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="menu-group-header w-full group flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 text-gray-600 dark:text-gray-400 hover:scale-[1.01]"
                    >
                      {group.icon && (
                        <div className="p-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/60 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                          {React.createElement(group.icon, {
                            className: "h-4 w-4 text-gray-500 dark:text-gray-400"
                          })}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <span className="text-sm font-semibold group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                          {language === 'ar' ? group.label : group.labelEn}
                        </span>
                      </div>
                      <div className="transition-all duration-300 ease-out" style={{ 
                        transform: expandedGroups[group.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                        color: expandedGroups[group.id] ? '#3b82f6' : 'inherit'
                      }}>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>
                    
                    {/* Group Items */}
                    <div className={`overflow-hidden transition-all duration-500 ease-out ${
                      expandedGroups[group.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="space-y-1 ml-2 rtl:mr-2 rtl:ml-0 pl-4 rtl:pr-4 rtl:pl-0 border-l-2 rtl:border-r-2 rtl:border-l-0 border-gray-200/50 dark:border-gray-600/30 relative">
                        {/* Animated connecting line */}
                        <div className={`absolute top-0 left-0 rtl:right-0 rtl:left-auto w-0.5 bg-gradient-to-b from-blue-500/60 to-purple-500/60 transition-all duration-500 ${
                          expandedGroups[group.id] ? 'h-full opacity-100' : 'h-0 opacity-0'
                        }`}></div>
                        
                        {group.items.map((item, itemIndex) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setSidebarOpen(false);
                            }}
                            className={`menu-item w-full group flex items-center space-x-3 rtl:space-x-reverse px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.01] text-sm relative ${
                              activeTab === item.id
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-700/40 hover:shadow-sm hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                            style={{ 
                              animationDelay: `${(groupIndex * group.items.length + itemIndex) * 0.05}s`,
                              transform: expandedGroups[group.id] ? 'translateX(0)' : 'translateX(-10px)',
                              transition: 'all 0.3s ease-out'
                            }}
                          >
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                              activeTab === item.id
                                ? 'bg-white/20 backdrop-blur-sm'
                                : 'bg-gray-100/60 dark:bg-gray-700/40 group-hover:bg-gray-200/80 dark:group-hover:bg-gray-600/60'
                            }`}>
                              {React.createElement(item.icon, {
                                className: `h-4 w-4 transition-colors ${
                                  activeTab === item.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                }`
                              })}
                            </div>
                            <div className="flex-1 text-left">
                              <span className={`font-medium transition-colors ${
                                activeTab === item.id ? 'text-white' : 'text-gray-700 dark:text-gray-200'
                              }`}>
                                {language === 'ar' ? item.label : item.labelEn}
                              </span>
                            </div>
                            {activeTab === item.id && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Bottom padding for scroll indicator */}
            <div className="h-6"></div>
          </nav>
        </div>

        {/* Fixed Admin User Info & Logout Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3 bg-gradient-to-t from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-800/80 backdrop-blur-sm">
          {/* Quick Scroll to Top Button */}
          <button
            onClick={() => {
              const navElement = document.querySelector('.admin-sidebar-scroll');
              if (navElement) {
                navElement.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
          >
            <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>
            <span className="text-xs font-medium">
              {language === 'ar' ? 'العودة للأعلى' : 'Back to Top'}
            </span>
          </button>
          {/* Admin Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {language === 'ar' ? 'مدير النظام' : 'System Admin'}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg
                     bg-red-600 hover:bg-red-700 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {loggingOut ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span className="font-medium">
              {loggingOut 
                ? (language === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...') 
                : (language === 'ar' ? 'تسجيل الخروج' : 'Logout')
              }
            </span>
          </button>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Enhanced Top Bar */}
        <div className="admin-topbar bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 h-18 flex items-center justify-between px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-purple-50/30 dark:from-transparent dark:via-blue-900/10 dark:to-purple-900/10"></div>
          
          <div className="relative flex items-center space-x-6 rtl:space-x-reverse">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? menuItems.find(item => item.id === activeTab)?.label : menuItems.find(item => item.id === activeTab)?.labelEn}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'ar' ? 'إدارة شاملة ومتقدمة' : 'Comprehensive & Advanced Management'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center space-x-4 rtl:space-x-reverse">
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 min-w-[300px]">
              <Search className="h-4 w-4 text-gray-400 mr-3 rtl:ml-3 rtl:mr-0" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في لوحة التحكم...' : 'Search in admin panel...'}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notifications */}
            <button className="relative p-3 rounded-2xl bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all duration-300 hover:scale-105">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                4
              </span>
            </button>

            {/* Admin Profile */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-2xl px-4 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {language === 'ar' ? 'مدير النظام' : 'System Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {currentUser?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div ref={contentRef} className="max-w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;