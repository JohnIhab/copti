import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from '../services/firebase';
import { auth } from '../services/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(
        language === 'ar' 
          ? 'تم تسجيل الدخول بنجاح'
          : 'Successfully logged in'
      );
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(
        language === 'ar' 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
        style={{
          backgroundImage: `url('/Images/hero.jpg')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content container */}
      <div 
        className="relative z-10 w-full h-full flex justify-center items-center"
        style={{
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
      {/* Header */}
      

      {/* Login/Register Modal */}
      {showPopup && (
        <div 
          className={`relative w-96 bg-transparent border-2 border-white/50 rounded-3xl backdrop-blur-3xl shadow-2xl flex justify-center items-center overflow-hidden transition-all duration-500 ease-in-out ${
            showPopup ? 'scale-100' : 'scale-0'
          } h-130`}
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-0 right-0 w-11 h-11 bg-slate-800 text-2xl text-white flex justify-center items-center rounded-bl-3xl cursor-pointer z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Login Form */}
          <div className="w-full p-10">
            <h2 className="text-3xl text-slate-800 text-center mb-8">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="relative w-full h-12 border-b-2 border-slate-800 my-8">
                <Mail className="absolute right-2 text-xl text-slate-800 top-3.5 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none focus:border-none focus:outline-none text-base text-slate-800 font-semibold pr-9 pl-1 peer"
                />
                <label className="absolute top-1/2 left-1 -translate-y-1/2 text-base text-slate-800 font-medium pointer-events-none transition-all duration-500 peer-focus:-top-1 peer-valid:-top-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
              </div>

              {/* Password Input */}
              <div className="relative w-full h-12 border-b-2 border-slate-800 my-8">
                <Lock className="absolute right-2 text-xl text-slate-800 top-3.5 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none focus:border-none focus:outline-none text-base text-slate-800 font-semibold pr-9 pl-1 peer"
                />
                <label className="absolute top-1/2 left-1 -translate-y-1/2 text-base text-slate-800 font-medium pointer-events-none transition-all duration-500 peer-focus:-top-1 peer-valid:-top-1">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
              </div>

              {/* Security Code Input */}
              <div className="relative w-full h-12 border-b-2 border-slate-800 my-8">
                <Lock className="absolute right-2 text-xl text-slate-800 top-3.5 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="w-full h-full bg-transparent border-none outline-none focus:border-none focus:outline-none text-base text-slate-800 font-semibold pr-9 pl-1 peer"
                />
                <label className="absolute top-1/2 left-1 -translate-y-1/2 text-base text-slate-800 font-medium pointer-events-none transition-all duration-500 peer-focus:-top-1 peer-valid:-top-1">
                  {language === 'ar' ? 'رمز الحماية' : 'Security Code'}
                </label>
              </div>

              

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-slate-800 border-none outline-none rounded-md cursor-pointer text-base text-white font-medium disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Login'
                )}
              </button>


            </form>
          </div>


        </div>
      )}
      </div>
    </div>
  );
};

export default Login;