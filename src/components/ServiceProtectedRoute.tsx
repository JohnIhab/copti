import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceProtectedRouteProps {
	children: React.ReactNode;
}

const ServiceProtectedRoute: React.FC<ServiceProtectedRouteProps> = ({ children }) => {
	const { currentUser, loading, appUser } = useAuth() as any;
	const { language } = useLanguage();

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					<p className="text-gray-600 dark:text-gray-400">
						{language === 'ar' ? 'جاري التحقق من صلاحيات الوصول...' : 'Verifying access permissions...'}
					</p>
				</div>
			</div>
		);
	}

	if (!currentUser || !appUser) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
				<div className="max-w-md w-full text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						{language === 'ar' ? 'وصول محظور' : 'Access Denied'}
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						{language === 'ar' ? 'هذه الصفحة محمية. يجب تسجيل الدخول كخدام للوصول.' : 'This page is protected. You must login as a service user to access.'}
					</p>
					<button
						onClick={() => window.location.href = '/login'}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
					>
						{language === 'ar' ? 'تسجيل الدخول' : 'Login'}
					</button>
				</div>
			</div>
		);
	}

		// role for service users in Firestore is stored as Arabic 'خادم'
		const role = appUser.role;
		if (role !== 'خادم') {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
				<div className="max-w-md w-full text-center">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
						{language === 'ar' ? 'غير مصرح' : 'Unauthorized'}
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						{language === 'ar' ? 'ليس لديك صلاحية الوصول إلى هذه الصفحة.' : "You don't have permission to access this page."}
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default ServiceProtectedRoute;
