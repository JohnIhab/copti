import React, { useState } from 'react';
import { Plus, BarChart3, Calendar, Star, MapPin, Heart, MessageSquare, DollarSign, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMeetings } from '../../contexts/MeetingsContext';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { language } = useLanguage();
  const { meetings, updateMeeting, deleteMeeting } = useMeetings();
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Categories mapping
  const categories = [
    { key: 'youth', label: 'الشباب', labelEn: 'Youth' },
    { key: 'children', label: 'الأطفال', labelEn: 'Children' },
    { key: 'servants', label: 'الخدام', labelEn: 'Servants' },
    { key: 'ladies', label: 'السيدات', labelEn: 'Ladies' },
    { key: 'men', label: 'الرجال', labelEn: 'Men' },
    { key: 'general', label: 'عام', labelEn: 'General' }
  ];

  // Helper function to get category label
  const getCategoryLabel = (categoryKey: string) => {
    const category = categories.find(c => c.key === categoryKey);
    return language === 'ar' ? (category?.label || categoryKey) : (category?.labelEn || categoryKey);
  };

  const stats = [
    { title: 'إجمالي الأعضاء', titleEn: 'Total Members', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { title: 'الاجتماعات هذا الشهر', titleEn: 'Meetings This Month', value: meetings.length.toString(), change: '+8%', color: 'bg-green-500' },
    { title: 'التبرعات هذا الشهر', titleEn: 'Donations This Month', value: '25,000 ج.م', change: '+15%', color: 'bg-yellow-500' },
    { title: 'الرحلات القادمة', titleEn: 'Upcoming Trips', value: '8', change: '+3%', color: 'bg-purple-500' }
  ];

  const handleEditMeeting = (meeting: any) => {
    setEditingMeeting(meeting.id);
    setEditForm({
      title: meeting.title,
      titleEn: meeting.titleEn,
      time: meeting.time,
      location: meeting.location,
      capacity: meeting.capacity
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
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الاجتماع؟' : 'Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId);
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    }
  };

  return (
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

      {/* Enhanced Meetings Management Section */}
      <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إدارة الاجتماعات السريعة' : 'Quick Meetings Management'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {language === 'ar' ? 'عرض وتعديل الاجتماعات بسهولة' : 'View and edit meetings easily'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('meetings')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>{language === 'ar' ? 'إضافة اجتماع' : 'Add Meeting'}</span>
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {language === 'ar' ? 'لا توجد اجتماعات' : 'No Meetings Available'}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {language === 'ar' ? 'ابدأ بإضافة اجتماع جديد' : 'Start by adding a new meeting'}
            </p>
            <button
              onClick={() => setActiveTab('meetings')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'إضافة أول اجتماع' : 'Add First Meeting'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.slice(0, 6).map((meeting) => (
              <div key={meeting.id} className="group relative">
                {/* Enhanced Meeting Card */}
                <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full translate-y-4 -translate-x-4"></div>
                  
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shadow-sm">
                        {getCategoryLabel(meeting.category)}
                      </span>
                    </div>                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEditMeeting(meeting)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-blue-600 hover:text-blue-700"
                      title={language === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 text-red-600 hover:text-red-700"
                      title={language === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="relative pt-8">
                    {editingMeeting === meeting.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-3 py-2 text-lg font-bold bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors duration-200 form-input-smooth"
                          placeholder={language === 'ar' ? 'عنوان الاجتماع' : 'Meeting Title'}
                        />
                        <input
                          type="text"
                          value={editForm.time || ''}
                          onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                          className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                          placeholder={language === 'ar' ? 'الوقت' : 'Time'}
                        />
                        <input
                          type="text"
                          value={editForm.location || ''}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                          placeholder={language === 'ar' ? 'المكان' : 'Location'}
                        />
                        <input
                          type="number"
                          value={editForm.capacity || ''}
                          onChange={(e) => setEditForm({...editForm, capacity: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors duration-200 form-input-smooth"
                          placeholder={language === 'ar' ? 'العدد الأقصى' : 'Capacity'}
                        />
                        <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                          <button
                            onClick={() => handleSaveEdit(meeting.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                          >
                            <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
                          </button>
                          <button
                            onClick={() => setEditingMeeting(null)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                          {language === 'ar' ? meeting.title : meeting.titleEn}
                        </h4>
                        
                        {meeting.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {language === 'ar' ? meeting.subtitle : meeting.subtitleEn}
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">{language === 'ar' ? meeting.day : meeting.dayEn}</p>
                              <p className="text-xs text-gray-500">{meeting.time}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{language === 'ar' ? meeting.location : meeting.locationEn}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium">{meeting.registered || 0} / {meeting.capacity}</p>
                              <p className="text-xs text-gray-500">{language === 'ar' ? 'مشارك' : 'participants'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{language === 'ar' ? 'معدل التسجيل' : 'Registration Rate'}</span>
                            <span>{Math.round(((meeting.registered || 0) / meeting.capacity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(((meeting.registered || 0) / meeting.capacity) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Quick Action */}
                        <button
                          onClick={() => setActiveTab('meetings')}
                          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {meetings.length > 6 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center space-x-2 rtl:space-x-reverse mx-auto transition-colors"
            >
              <span>{language === 'ar' ? 'عرض جميع الاجتماعات' : 'View All Meetings'}</span>
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;