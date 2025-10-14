import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Shield, Save, AlertCircle, Eye, EyeOff, Wrench } from 'lucide-react';
import { auth } from '../../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

import { getMaintenanceMode, setMaintenanceMode } from '../../services/maintenanceService';



const SettingsPage: React.FC = () => {
    const { language } = useLanguage();

    // Maintenance mode state
    const [maintenance, setMaintenance] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(true);
    const [maintenanceSaving, setMaintenanceSaving] = useState(false);
    const [maintenanceError, setMaintenanceError] = useState('');

    useEffect(() => {
        let mounted = true;
        setMaintenanceLoading(true);
        getMaintenanceMode().then((enabled) => {
            if (mounted) setMaintenance(enabled);
        }).catch(() => {
            if (mounted) setMaintenanceError('Error loading maintenance mode');
        }).finally(() => {
            if (mounted) setMaintenanceLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    const handleMaintenanceToggle = async () => {
        setMaintenanceSaving(true);
        setMaintenanceError('');
        try {
            await setMaintenanceMode(!maintenance);
            setMaintenance(!maintenance);
        } catch (err) {
            setMaintenanceError(language === 'ar' ? 'حدث خطأ أثناء تحديث وضع الصيانة' : 'Error updating maintenance mode');
        } finally {
            setMaintenanceSaving(false);
        }
    };

    // Password change state
    const [passwordFields, setPasswordFields] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showPw, setShowPw] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState('');



    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordFields((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwSaving(true);
        setPwError('');
        setPwSuccess(false);
        if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
            setPwError(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
            setPwSaving(false);
            return;
        }
        if (passwordFields.new !== passwordFields.confirm) {
            setPwError(language === 'ar' ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
            setPwSaving(false);
            return;
        }
        if (passwordFields.new.length < 6) {
            setPwError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            setPwSaving(false);
            return;
        }
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                setPwError(language === 'ar' ? 'لم يتم العثور على حساب المدير الحالي' : 'Current admin account not found');
                setPwSaving(false);
                return;
            }
            // Re-authenticate
            const credential = EmailAuthProvider.credential(user.email, passwordFields.current);
            await reauthenticateWithCredential(user, credential);
            // Update password
            await updatePassword(user, passwordFields.new);
            setPwSuccess(true);
            setPasswordFields({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            if (err.code === 'auth/wrong-password') {
                setPwError(language === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
            } else if (err.code === 'auth/too-many-requests') {
                setPwError(language === 'ar' ? 'تم حظر المحاولة مؤقتًا. حاول لاحقًا.' : 'Too many attempts. Try again later.');
            } else {
                setPwError(language === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'An error occurred while changing password');
            }
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl mt-8 space-y-10">
            {/* Maintenance Mode Toggle */}
            <div className="mb-10">
                <div className="flex items-center mb-6 space-x-3 rtl:space-x-reverse">
                    <Wrench className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
                    </h2>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button
                        type="button"
                        onClick={handleMaintenanceToggle}
                        disabled={maintenanceLoading || maintenanceSaving}
                        className={`px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-white ${maintenance ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {maintenance
                            ? (maintenanceSaving
                                ? (language === 'ar' ? 'جارٍ إيقاف الصيانة...' : 'Disabling Maintenance...')
                                : (language === 'ar' ? 'إيقاف وضع الصيانة' : 'Disable Maintenance'))
                            : (maintenanceSaving
                                ? (language === 'ar' ? 'جارٍ تفعيل الصيانة...' : 'Enabling Maintenance...')
                                : (language === 'ar' ? 'تفعيل وضع الصيانة' : 'Enable Maintenance'))}
                    </button>
                    <span className="ml-2 rtl:mr-2 text-gray-700 dark:text-gray-200">
                        {maintenance
                            ? (language === 'ar' ? 'الموقع تحت الصيانة' : 'Site is under maintenance')
                            : (language === 'ar' ? 'الموقع يعمل' : 'Site is running')}
                    </span>
                </div>
                {maintenanceError && (
                    <div className="flex items-center text-red-600 dark:text-red-400 mt-2">
                        <AlertCircle className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                        <span>{maintenanceError}</span>
                    </div>
                )}
            </div>
            {/* Change Admin Password */}
            <div>
                <div className="flex items-center mb-6 space-x-3 rtl:space-x-reverse">
                    <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {language === 'ar' ? 'تغيير كلمة مرور المدير' : 'Change Admin Password'}
                    </h2>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPw.current ? 'text' : 'password'}
                                name="current"
                                value={passwordFields.current}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية...' : 'Enter current password...'}
                                required
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => setShowPw((prev) => ({ ...prev, current: !prev.current }))}
                            >
                                {showPw.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPw.new ? 'text' : 'password'}
                                name="new"
                                value={passwordFields.new}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة...' : 'Enter new password...'}
                                required
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => setShowPw((prev) => ({ ...prev, new: !prev.new }))}
                            >
                                {showPw.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPw.confirm ? 'text' : 'password'}
                                name="confirm"
                                value={passwordFields.confirm}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور الجديدة...' : 'Re-enter new password...'}
                                required
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => setShowPw((prev) => ({ ...prev, confirm: !prev.confirm }))}
                            >
                                {showPw.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={pwSaving}
                        className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {pwSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>{language === 'ar' ? 'جارٍ التغيير...' : 'Changing...'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                <span>{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                            </>
                        )}
                    </button>
                    {pwSuccess && (
                        <div className="flex items-center text-green-600 dark:text-green-400 mt-2">
                            <span className="font-medium mr-2 rtl:ml-2 rtl:mr-0">{language === 'ar' ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!'}</span>
                        </div>
                    )}
                    {pwError && (
                        <div className="flex items-center text-red-600 dark:text-red-400 mt-2">
                            <AlertCircle className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                            <span>{pwError}</span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
