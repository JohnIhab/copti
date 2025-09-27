import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import Meetings from './pages/Meetings';
import Events from './pages/Events';
import Trips from './pages/Trips';
import Donations from './pages/Donations';
import Confession from './pages/Confession';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for animations to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>







        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={
                <>
                  <Navigation />
                  <Hero />
                  <Features />
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
              <Route path="/contact" element={
                <>
                  <Navigation />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;