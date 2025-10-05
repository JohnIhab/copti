import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Book } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { signOut, auth } from '../services/firebase';
import { toast } from 'react-toastify';
import {
  AdminSidebar,
  AdminTopbar,
  AdminDashboard,
  EventsManagement,
  TripsManagement,
  DonationsManagement,
  MeetingsManagement,
  ContactMessagesManagement,
  ConfessionsManagement,
  UsersManagement,
  UnderDevelopment
} from '../components/admin';

gsap.registerPlugin(ScrollTrigger);

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  
  // Core admin state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const adminRef = useRef<HTMLDivElement>(null);
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
      toast.success(
        language === 'ar' 
          ? 'تم تسجيل الخروج بنجاح'
          : 'Successfully logged out'
      );
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.'
          : 'An error occurred during logout. Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

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

  // Enhanced GSAP animations
  useEffect(() => {
    if (!adminRef.current) return;

    const tl = gsap.timeline();

    // Reset elements
    gsap.set('.admin-sidebar', { x: language === 'ar' ? 100 : -100, opacity: 0 });
    gsap.set('.admin-topbar', { y: -50, opacity: 0 });
    gsap.set('.admin-card', { opacity: 0, y: 50, scale: 0.9, rotationX: 15 });
    gsap.set('.stat-card', { opacity: 0, x: -50, scale: 0.8 });
    gsap.set('.menu-item', { opacity: 0, x: language === 'ar' ? 30 : -30 });
    gsap.set('.content-header', { opacity: 0, y: -30 });

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

    // Enhanced hover animations for cards only
    const cards = document.querySelectorAll('.admin-card, .stat-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.02,
          y: -5,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard setActiveTab={setActiveTab} />;
      case 'events':
        return <EventsManagement />;
      case 'trips':
        return <TripsManagement />;
      case 'donations':
        return <DonationsManagement />;
      case 'confessions':
        return <ConfessionsManagement />;
      case 'users':
        return <UsersManagement />;
      case 'bible':
        return <UnderDevelopment title="قراءة الكتاب المقدس" titleEn="Bible Reading" icon={Book} />;
      case 'contact':
        return <ContactMessagesManagement />;
      case 'meetings':
        return <MeetingsManagement />;
      case 'reports':
      case 'analytics':
      case 'notifications':
      case 'backup':
      case 'security':
      case 'permissions':
      case 'settings':
        return <UnderDevelopment title="الإعدادات" titleEn="Settings" />;
      default:
        return <UnderDevelopment title="القسم غير متوفر" titleEn="Section Not Available" />;
    }
  };

  return (
    <div 
      ref={adminRef}
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30
                  dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 
                  flex ${language === 'ar' ? 'rtl' : 'ltr'} relative`}
    >
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>
      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expandedGroups={expandedGroups}
        toggleGroup={toggleGroup}
        onLogout={handleLogout}
        loggingOut={loggingOut}
        currentUserEmail={currentUser?.email || undefined}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Bar */}
        <AdminTopbar
          activeTab={activeTab}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUserEmail={currentUser?.email || undefined}
        />
        
        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div ref={contentRef} className="max-w-full relative">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;