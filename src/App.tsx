import { useState, useEffect } from 'react';
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
import ThreeDWaveGallery from './components/ThreeDWaveGallery';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBibleVerse, setShowBibleVerse] = useState(false);

  useEffect(() => {
    // Simulate loading time for animations to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show Bible verse modal after loading is complete
      setShowBibleVerse(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
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
                    <ThreeDWaveGallery />
                    <Features />
                    <ImageGallery />
                    <About />
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
                <Route path="/admin" element={
                  
                  <ProtectedRoute>
                    <Navigation />
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/services-dashboard" element={
                  <ServiceProtectedRoute>
                    <Navigation />
                    <ServicesDashboard />
                  </ServiceProtectedRoute>
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