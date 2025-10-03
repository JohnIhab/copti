import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  UserCheck,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

interface ConfessionAppointment {
  id: number;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  priest: string;
  priestEn: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface TimeSlot {
  id: number;
  date: string;
  time: string;
  priest: string;
  priestEn: string;
  available: boolean;
  maxAppointments: number;
  currentAppointments: number;
}

const ConfessionsManagement: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'statistics'>('appointments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<ConfessionAppointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual Firebase data
  const [appointments, setAppointments] = useState<ConfessionAppointment[]>([
    {
      id: 1,
      userName: 'أحمد محمد',
      userPhone: '+20123456789',
      date: '2025-01-25',
      time: '10:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      notes: 'طلب اعتراف خاص',
      status: 'pending',
      createdAt: '2025-01-20T10:00:00Z'
    },
    {
      id: 2,
      userName: 'سارة أحمد',
      userPhone: '+20123456788',
      date: '2025-01-25',
      time: '11:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      status: 'confirmed',
      createdAt: '2025-01-19T15:30:00Z'
    },
    {
      id: 3,
      userName: 'مينا جورج',
      userPhone: '+20123456787',
      date: '2025-01-25',
      time: '2:00 PM',
      priest: 'أبونا مرقس',
      priestEn: 'Father Marcus',
      status: 'completed',
      createdAt: '2025-01-18T12:00:00Z'
    }
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: 1,
      date: '2025-01-25',
      time: '10:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      available: true,
      maxAppointments: 5,
      currentAppointments: 1
    },
    {
      id: 2,
      date: '2025-01-25',
      time: '11:00 AM',
      priest: 'أبونا يوسف',
      priestEn: 'Father Youssef',
      available: true,
      maxAppointments: 5,
      currentAppointments: 1
    },
    {
      id: 3,
      date: '2025-01-25',
      time: '2:00 PM',
      priest: 'أبونا مرقس',
      priestEn: 'Father Marcus',
      available: true,
      maxAppointments: 8,
      currentAppointments: 1
    }
  ]);

  useEffect(() => {
    if (!contentRef.current) return;

    gsap.fromTo('.admin-card',
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      }
    );
  }, [activeTab]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.userPhone.includes(searchQuery) ||
                         appointment.priest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDate = !dateFilter || appointment.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const updateAppointmentStatus = (id: number, status: ConfessionAppointment['status']) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
    
    const statusText = {
      pending: language === 'ar' ? 'في الانتظار' : 'Pending',
      confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
      completed: language === 'ar' ? 'مكتمل' : 'Completed',
      cancelled: language === 'ar' ? 'ملغي' : 'Cancelled'
    };
    
    toast.success(
      language === 'ar' 
        ? `تم تحديث حالة الموعد إلى: ${statusText[status]}`
        : `Appointment status updated to: ${statusText[status]}`
    );
  };

  const deleteAppointment = (id: number) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا الموعد؟'
        : 'Are you sure you want to delete this appointment?'
    );
    
    if (confirmed) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast.success(
        language === 'ar' ? 'تم حذف الموعد بنجاح' : 'Appointment deleted successfully'
      );
    }
  };

  const addTimeSlot = (newSlot: Omit<TimeSlot, 'id'>) => {
    const id = Math.max(...timeSlots.map(slot => slot.id)) + 1;
    setTimeSlots(prev => [...prev, { ...newSlot, id }]);
    toast.success(
      language === 'ar' ? 'تم إضافة الوقت بنجاح' : 'Time slot added successfully'
    );
    setShowScheduleModal(false);
    setEditingSlot(null);
  };

  const updateTimeSlot = (id: number, updatedSlot: Partial<TimeSlot>) => {
    setTimeSlots(prev => 
      prev.map(slot => slot.id === id ? { ...slot, ...updatedSlot } : slot)
    );
    toast.success(
      language === 'ar' ? 'تم تحديث الوقت بنجاح' : 'Time slot updated successfully'
    );
    setShowScheduleModal(false);
    setEditingSlot(null);
  };

  const deleteTimeSlot = (id: number) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا الوقت؟'
        : 'Are you sure you want to delete this time slot?'
    );
    
    if (confirmed) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
      toast.success(
        language === 'ar' ? 'تم حذف الوقت بنجاح' : 'Time slot deleted successfully'
      );
    }
  };

  const getStatusColor = (status: ConfessionAppointment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: ConfessionAppointment['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <UserCheck className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const exportAppointments = () => {
    const csvContent = [
      ['Name', 'Phone', 'Date', 'Time', 'Priest', 'Status', 'Notes', 'Created At'],
      ...filteredAppointments.map(apt => [
        apt.userName,
        apt.userPhone,
        apt.date,
        apt.time,
        language === 'ar' ? apt.priest : apt.priestEn,
        apt.status,
        apt.notes || '',
        new Date(apt.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const AppointmentModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تفاصيل الموعد' : 'Appointment Details'}
            </h3>
            <button
              onClick={() => setShowAppointmentModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{selectedAppointment.userName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{selectedAppointment.userPhone}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedAppointment.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الوقت' : 'Time'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">{selectedAppointment.time}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الكاهن' : 'Priest'}
                  </label>
                  <span className="text-gray-900 dark:text-white">
                    {language === 'ar' ? selectedAppointment.priest : selectedAppointment.priestEn}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getStatusIcon(selectedAppointment.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {language === 'ar' ? {
                        pending: 'في الانتظار',
                        confirmed: 'مؤكد',
                        completed: 'مكتمل',
                        cancelled: 'ملغي'
                      }[selectedAppointment.status] : selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </label>
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                    <span className="text-gray-900 dark:text-white">{selectedAppointment.notes}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تأكيد' : 'Confirm'}</span>
                </button>
                
                <button
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? 'مكتمل' : 'Complete'}</span>
                </button>
                
                <button
                  onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
                </button>
                
                <button
                  onClick={() => deleteAppointment(selectedAppointment.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ScheduleModal: React.FC = () => {
    const [formData, setFormData] = useState({
      date: editingSlot?.date || '',
      time: editingSlot?.time || '',
      priest: editingSlot?.priest || '',
      priestEn: editingSlot?.priestEn || '',
      maxAppointments: editingSlot?.maxAppointments || 5,
      available: editingSlot?.available ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.date || !formData.time || !formData.priest || !formData.priestEn) {
        toast.error(
          language === 'ar' 
            ? 'يرجى ملء جميع الحقول المطلوبة'
            : 'Please fill in all required fields'
        );
        return;
      }

      const slotData = {
        ...formData,
        currentAppointments: editingSlot?.currentAppointments || 0
      };

      if (editingSlot) {
        updateTimeSlot(editingSlot.id, slotData);
      } else {
        addTimeSlot(slotData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-90vh overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSlot 
                  ? (language === 'ar' ? 'تعديل الوقت' : 'Edit Time Slot')
                  : (language === 'ar' ? 'إضافة وقت جديد' : 'Add New Time Slot')
                }
              </h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setEditingSlot(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'التاريخ' : 'Date'} *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'الوقت' : 'Time'} *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'اسم الكاهن (بالعربية)' : 'Priest Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.priest}
                  onChange={(e) => setFormData(prev => ({ ...prev, priest: e.target.value }))}
                  placeholder={language === 'ar' ? 'أبونا يوسف' : 'أبونا يوسف'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'اسم الكاهن (بالإنجليزية)' : 'Priest Name (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.priestEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, priestEn: e.target.value }))}
                  placeholder={language === 'ar' ? 'Father Youssef' : 'Father Youssef'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'الحد الأقصى للمواعيد' : 'Maximum Appointments'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxAppointments}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-2 rtl:mr-2 rtl:ml-0 block text-sm text-gray-900 dark:text-white">
                  {language === 'ar' ? 'متاح للحجز' : 'Available for booking'}
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingSlot(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSlot 
                    ? (language === 'ar' ? 'تحديث' : 'Update')
                    : (language === 'ar' ? 'إضافة' : 'Add')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={contentRef} className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="admin-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إدارة الاعتراف' : 'Confessions Management'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'ar' 
                ? 'إدارة مواعيد الاعتراف والجدولة الزمنية'
                : 'Manage confession appointments and scheduling'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={exportAppointments}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تصدير' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-card bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 rtl:space-x-reverse px-6">
            {[
              { key: 'appointments', label: language === 'ar' ? 'المواعيد' : 'Appointments', icon: Calendar },
              { key: 'schedule', label: language === 'ar' ? 'الجدولة' : 'Schedule', icon: Clock },
              { key: 'statistics', label: language === 'ar' ? 'الإحصائيات' : 'Statistics', icon: UserCheck }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 rtl:space-x-reverse transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'البحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="pending">{language === 'ar' ? 'في الانتظار' : 'Pending'}</option>
                  <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                  <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                  <option value="cancelled">{language === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                </select>
                
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </button>
              </div>

              {/* Appointments List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الاسم' : 'Name'}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الكاهن' : 'Priest'}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {appointment.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.userPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {appointment.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {language === 'ar' ? appointment.priest : appointment.priestEn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 rtl:mr-1 rtl:ml-0">
                              {language === 'ar' ? {
                                pending: 'في الانتظار',
                                confirmed: 'مؤكد',
                                completed: 'مكتمل',
                                cancelled: 'ملغي'
                              }[appointment.status] : appointment.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowAppointmentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {language === 'ar' ? 'لا توجد مواعيد' : 'No appointments found'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'ar' 
                        ? 'لا توجد مواعيد تطابق المعايير المحددة'
                        : 'No appointments match the specified criteria'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'الجدولة الزمنية' : 'Time Slots'}
                </h3>
                <button
                  onClick={() => {
                    setEditingSlot(null);
                    setShowScheduleModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة وقت' : 'Add Slot'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {new Date(slot.date).toLocaleDateString()} - {slot.time}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? slot.priest : slot.priestEn}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <button
                          onClick={() => {
                            setEditingSlot(slot);
                            setShowScheduleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTimeSlot(slot.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'الحد الأقصى:' : 'Max:'}
                        </span>
                        <span className="text-gray-900 dark:text-white">{slot.maxAppointments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'ar' ? 'المحجوزة:' : 'Booked:'}
                        </span>
                        <span className="text-gray-900 dark:text-white">{slot.currentAppointments}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(slot.currentAppointments / slot.maxAppointments) * 100}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs ${slot.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {slot.available 
                          ? (language === 'ar' ? 'متاح' : 'Available')
                          : (language === 'ar' ? 'غير متاح' : 'Unavailable')
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div className="ml-4 rtl:mr-4 rtl:ml-0">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {language === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {appointments.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="ml-4 rtl:mr-4 rtl:ml-0">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {language === 'ar' ? 'مكتملة' : 'Completed'}
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {appointments.filter(apt => apt.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    <div className="ml-4 rtl:mr-4 rtl:ml-0">
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        {language === 'ar' ? 'في الانتظار' : 'Pending'}
                      </p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {appointments.filter(apt => apt.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                  <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="ml-4 rtl:mr-4 rtl:ml-0">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {language === 'ar' ? 'الأوقات المتاحة' : 'Available Slots'}
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {timeSlots.filter(slot => slot.available).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAppointmentModal && <AppointmentModal />}
      {showScheduleModal && <ScheduleModal />}
    </div>
  );
};

export default ConfessionsManagement;