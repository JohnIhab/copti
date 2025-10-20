import { useState, useEffect } from 'react';
import { getMaintenanceMode } from './services/maintenanceService';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import BibleVerseModal from './components/BibleVerseModal';
import ProtectedRoute from './components/ProtectedRoute';
import ServiceProtectedRoute from './components/ServiceProtectedRoute';
import ServicesDashboard from './pages/ServicesDashboard';
import Meetings from './pages/Meetings';
import Events from './pages/Events';
import Trips from './pages/Trips';
import Donations from './pages/Donations';
import Confession from './pages/Confession';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ImageGallery from './components/ImageGallery';
import ReadBible from './pages/ReadBible';
import NotFound from './pages/NotFound';
import AboutPage from './pages/About';
import CherchRole from './components/CherchRole';
import ScrollToTop from './components/ScrollToTop';
import TermsAndConditions from './pages/TermsAndConditions';
import News from './pages/News';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBibleVerse, setShowBibleVerse] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for animations to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowBibleVerse(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    setMaintenanceLoading(true);
    getMaintenanceMode().then((enabled) => {
      if (mounted) setMaintenance(enabled);
    }).finally(() => {
      if (mounted) setMaintenanceLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (isLoading || maintenanceLoading) {
    return <PageLoader />;
  }

  if (maintenance && window.location.pathname !== '/admin' && window.location.pathname !== '/login') {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="p-8 rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-yellow-400 dark:border-yellow-600 text-center">
        <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">
          الموقع الآن تحت الصيانة 🚧
        </h1>
        <p className="text-gray-700 dark:text-gray-200">
          This site is currently under maintenance for updates.
        </p>
      </div>
    </div>
  );
}

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                <BibleVerseModal 
                  isOpen={showBibleVerse} 
                  onClose={() => setShowBibleVerse(false)} 
                />
                <Routes>
                <Route path="/" element={
                  <>
                    <Navigation />
                    <Hero />
                    <ImageGallery />
                    <Features />
                    <CherchRole />
                    <About />
                    <Footer />
                  </>
                } />
                <Route path='/aboutpage' element={
                  <>
                    <Navigation />
                    <AboutPage />
                    <Footer />
                  </>
                } />
                <Route path="/meetings" element={
                  <>
                    <Navigation />
                    <Meetings />
                    <Footer />
                  </>
                } />
                <Route path="/events" element={
                  <>
                    <Navigation />
                    <Events />
                    <Footer />
                  </>
                } />
                <Route path="/trips" element={
                  <>
                    <Navigation />
                    <Trips />
                    <Footer />
                  </>
                } />
                <Route path="/donations" element={
                  <>
                    <Navigation />
                    <Donations />
                    <Footer />
                  </>
                } />
                <Route path="/confession" element={
                  <>
                    <Navigation />
                    <Confession />
                    <Footer />
                  </>
                } />
                <Route path="/read-bible" element={
                  <>
                    <Navigation />
                    <ReadBible />
                    <Footer />
                  </>
                } />
                <Route path="/contact" element={
                  <>
                    <Navigation />
                    <Contact />
                    <Footer />
                  </>
                } />
                
                <Route path="/login" element={<Login />} />
                <Route path="/news" element={<News />} />
                <Route path="/admin" element={
                  
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/services-dashboard" element={
                  <ServiceProtectedRoute>
                    <Navigation />
                    <ServicesDashboard />
                  </ServiceProtectedRoute>
                } />
                <Route path='terms-and-conditions' element={
                  <>
                    <Navigation />
                    <TermsAndConditions />
                    <Footer />
                  </>
                } />
                <Route path="*" element={
                  <>
                    <Navigation />
                    <NotFound />
                    <Footer />
                  </>
                } />
              </Routes>
              </div>
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{ 
                  fontFamily: 'inherit',
                  direction: 'rtl'
                }}
              />
            </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;