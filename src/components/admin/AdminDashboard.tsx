import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import { Plus, BarChart3, Calendar, Star, MapPin, Heart, MessageSquare, Users, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { donationsService } from '../../services/donationsService';
import { usersService } from '../../services/usersService';
import { tripsService } from '../../services/tripsService';

interface Meeting {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  locationEn: string;
  type: string;
  typeEn: string;
  description: string;
  descriptionEn: string;
  organizer: string;
  organizerEn: string;
  maxAttendees: number;
  currentAttendees: number;
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const { language } = useLanguage();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [donationStats, setDonationStats] = useState({
    totalAmount: 0,
    completedAmount: 0,
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loadingTotalTrips, setLoadingTotalTrips] = useState(true);
  // Load total trips count from Firebase
  const loadTotalTrips = async () => {
    try {
      setLoadingTotalTrips(true);
      const trips = await tripsService.getTrips();
      setTotalTrips(trips.length);
    } catch (error) {
      console.error('Error loading total trips:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ في تحميل عدد الرحلات'
          : 'Error loading total trips count'
      );
    } finally {
      setLoadingTotalTrips(false);
    }
  };

  // Load meetings from Firebase
  const loadMeetings = async () => {
    try {
      const meetingsRef = collection(db, 'meetings');
      const q = query(meetingsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const meetingsData: Meeting[] = [];
      querySnapshot.forEach((doc) => {
        meetingsData.push({
          id: doc.id,
          ...doc.data()
        } as Meeting);
      });
      
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحميل الاجتماعات'
          : 'Error loading meetings'
      );
    }
  };

  // Load donation statistics from Firebase
  const loadDonationStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await donationsService.getDonationStats();
      setDonationStats(stats);
    } catch (error) {
      console.error('Error loading donation stats:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحميل إحصائيات التبرعات'
          : 'Error loading donation statistics'
      );
    } finally {
      setLoadingStats(false);
    }
  };

  // Load total members count from Firebase
  const loadMembersCount = async () => {
    try {
      setLoadingMembers(true);
      const users = await usersService.getUsers();
      setTotalMembers(users.length);
    } catch (error) {
      console.error('Error loading members count:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحميل عدد الأعضاء'
          : 'Error loading members count'
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  // Load upcoming trips count from Firebase
  const loadUpcomingTrips = async () => {
    try {
      setLoadingTrips(true);
      const trips = await tripsService.getTrips();
      const currentDate = new Date();
      const _upcomingCount = trips.filter(trip => new Date(trip.date) >= currentDate).length;
      // keep a debug log for visibility in development
      console.debug('upcoming trips count:', _upcomingCount);
    } catch (error) {
      console.error('Error loading upcoming trips:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحميل عدد الرحلات القادمة'
          : 'Error loading upcoming trips count'
      );
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    loadMeetings();
    loadDonationStats();
    loadMembersCount();
    loadUpcomingTrips();
    loadTotalTrips();
  }, []);

  // Update meeting function
  const updateMeeting = async (meetingId: string, updatedData: any) => {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, updatedData);
      await loadMeetings(); // Refresh data
      toast.success(
        language === 'ar' 
          ? 'تم تحديث الاجتماع بنجاح'
          : 'Meeting updated successfully'
      );
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في تحديث الاجتماع'
          : 'Error updating meeting'
      );
      throw error;
    }
  };

  // Delete meeting function
  const deleteMeeting = async (meetingId: string) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
      await loadMeetings(); // Refresh data
      toast.success(
        language === 'ar' 
          ? 'تم حذف الاجتماع بنجاح'
          : 'Meeting deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ في حذف الاجتماع'
          : 'Error deleting meeting'
      );
      throw error;
    }
  };

  // Categories mapping
  const categories = [
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'prayer', label: 'صلاة', labelEn: 'Prayer' },
    { key: 'bible-study', label: 'دراسة كتابية', labelEn: 'Bible Study' },
    { key: 'worship', label: 'تسبيح', labelEn: 'Worship' },
    { key: 'leadership', label: 'قيادة', labelEn: 'Leadership' },
    { key: 'general', label: 'عام', labelEn: 'General' }
  ];

  // Helper function to get category label
  const getCategoryLabel = (categoryKey: string) => {
    const category = categories.find(c => c.key === categoryKey);
    return language === 'ar' ? (category?.label || categoryKey) : (category?.labelEn || categoryKey);
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0 ج.م';
    return `${amount.toLocaleString('ar-EG')} ج.م`;
  };

  const stats = [
    { 
      title: 'إجمالي الأعضاء', 
      titleEn: 'Total Members', 
      value: loadingMembers ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : totalMembers.toString(),
      change: loadingMembers ? '' : `${totalMembers} ${language === 'ar' ? 'عضو' : 'members'}`, 
      color: 'bg-blue-500' 
    },
  { title: 'إجمالي الاجتماعات', titleEn: 'Total Meetings', value: meetings.length.toString(), change: `${meetings.length} ${language === 'ar' ? 'اجتماع' : 'meetings'}`, color: 'bg-green-500' },
    { 
      title: 'إجمالي التبرعات', 
      titleEn: 'Total Donations', 
      value: loadingStats ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : formatCurrency(donationStats.completedAmount), 
      change: loadingStats ? '' : `${donationStats.completed} ${language === 'ar' ? 'مكتملة' : 'completed'}`, 
      color: 'bg-yellow-500' 
    },
    {
      title: 'عدد الرحلات',
      titleEn: 'Total Trips',
      value: loadingTotalTrips ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : totalTrips.toString(),
      change: loadingTotalTrips ? '' : `${totalTrips} ${language === 'ar' ? 'رحلة' : 'trips'}`,
      color: 'bg-indigo-500'
    }
  ];

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditForm({
      title: meeting.title,
      titleEn: meeting.titleEn,
      time: meeting.time,
      location: meeting.location,
      maxAttendees: meeting.maxAttendees
    });
  };

  const handleSaveEdit = async (meetingId: string) => {
    try {
      await updateMeeting(meetingId, editForm);
      setEditingMeeting(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    setMeetingToDelete(meetingId);
    setShowDeleteConfirm(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 tab-content mt-10">
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMeetingToDelete(null);
        }}
        onConfirm={async () => {
          if (meetingToDelete) {
            try {
              await deleteMeeting(meetingToDelete);
            } catch (error) {
              console.error('Error deleting meeting:', error);
            }
          }
          setShowDeleteConfirm(false);
          setMeetingToDelete(null);
        }}
        title={language === 'ar' ? 'حذف الاجتماع' : 'Delete Meeting'}
        message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الاجتماع؟' : 'Are you sure you want to delete this meeting?'}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
      />
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
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button 
              onClick={() => {
                loadMeetings();
                loadDonationStats();
                loadMembersCount();
                loadUpcomingTrips();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
              disabled={loadingStats || loadingMembers || loadingTrips}
            >
              <RefreshCw className={`h-4 w-4 ${(loadingStats || loadingMembers || loadingTrips) ? 'animate-spin' : ''}`} />
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button 
              onClick={() => setActiveTab('meetings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'اجتماع جديد' : 'New Meeting'}
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              {language === 'ar' ? 'فعالية جديدة' : 'New Event'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {language === 'ar' ? stat.title : stat.titleEn}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting', icon: Calendar, color: 'bg-blue-500', action: () => setActiveTab('meetings') },
            { label: language === 'ar' ? 'إضافة فعالية' : 'Add Event', icon: Star, color: 'bg-green-500', action: () => setActiveTab('events') },
            { label: language === 'ar' ? 'إضافة رحلة' : 'Add Trip', icon: MapPin, color: 'bg-purple-500', action: () => setActiveTab('trips') },
            { label: language === 'ar' ? 'إدارة التبرعات' : 'Manage Donations', icon: Heart, color: 'bg-pink-500', action: () => setActiveTab('donations') },
            { label: language === 'ar' ? 'الرسائل' : 'Messages', icon: MessageSquare, color: 'bg-indigo-500', action: () => setActiveTab('messages') },
            { label: language === 'ar' ? 'التقارير' : 'Reports', icon: BarChart3, color: 'bg-gray-500', action: () => {} }
          ].map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} p-4 rounded-lg text-white hover:opacity-90 transition-opacity duration-200 flex flex-col items-center gap-2`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Meetings Management Section */}
      <div className="meetings-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إدارة الاجتماعات السريعة' : 'Quick Meetings Management'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === 'ar' ? 'عرض وتعديل الاجتماعات بسهولة' : 'View and edit meetings easily'}
            </p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setActiveTab('meetings')}
          >
            {language === 'ar' ? 'عرض الكل' : 'View All'}
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد اجتماعات' : 'No Meetings Available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {language === 'ar' ? 'ابدأ بإضافة اجتماع جديد' : 'Start by adding a new meeting'}
            </p>
            <button
              onClick={() => setActiveTab('meetings')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.slice(0, 6).map((meeting) => (
              <div key={meeting.id} className="meeting-card bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {language === 'ar' ? meeting.title : meeting.titleEn}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                      {getCategoryLabel(meeting.type)}
                    </p>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {language === 'ar' ? meeting.description : meeting.descriptionEn}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEditMeeting(meeting)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{formatDate(meeting.date)}</p>
                        <p className="text-xs">{meeting.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-xs">{language === 'ar' ? meeting.location : meeting.locationEn}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium">{meeting.currentAttendees || 0} / {meeting.maxAttendees}</p>
                        <p className="text-xs">{language === 'ar' ? 'مسجل' : 'registered'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <div className="flex items-center">
                          <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  meeting.maxAttendees && meeting.maxAttendees > 0
                                    ? ((meeting.currentAttendees || 0) / meeting.maxAttendees) * 100
                                    : 0,
                                  100
                                )}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {meeting.maxAttendees && meeting.maxAttendees > 0
                              ? `${Math.round(((meeting.currentAttendees || 0) / meeting.maxAttendees) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {editingMeeting === meeting.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        placeholder={language === 'ar' ? 'عنوان الاجتماع' : 'Meeting Title'}
                      />
                      <input
                        type="time"
                        value={editForm.time || ''}
                        onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      />
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <button
                          onClick={() => handleSaveEdit(meeting.id)}
                          className="w-full sm:flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingMeeting(null);
                            setEditForm({});
                          }}
                          className="w-full sm:flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { 
                icon: Calendar, 
                color: 'text-blue-600', 
                action: language === 'ar' ? 'تم إنشاء اجتماع جديد' : 'New meeting created',
                time: language === 'ar' ? 'منذ ساعتين' : '2 hours ago'
              },
              { 
                icon: Users, 
                color: 'text-green-600', 
                action: language === 'ar' ? 'انضم عضو جديد' : 'New member joined',
                time: language === 'ar' ? 'منذ 3 ساعات' : '3 hours ago'
              },
              { 
                icon: Heart, 
                color: 'text-pink-600', 
                action: language === 'ar' ? 'تبرع جديد تم استلامه' : 'New donation received',
                time: language === 'ar' ? 'منذ يوم واحد' : '1 day ago'
              }
            ].map((activity, index) => (
              <div key={index} className="p-4 flex items-center space-x-4">
                <div className={`${activity.color} bg-opacity-10 p-2 rounded-lg`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">{activity.action}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;