import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  // Desktop images
  const desktopImages = [
    '/Images/hero.jpg',
    '/Images/card/2.jpg',
    '/Images/card/3.jpg',
    '/Images/card/4.jpg',
    '/Images/card/5.jpg'
  ];

  // Mobile images (you can replace these with mobile-optimized versions)
  const mobileImages = [
    '/Images/card/22.jpg',
    '/Images/card/33.jpg',
    '/Images/card/44.jpg',
    '/Images/card/55.jpg',
    '/Images/card/66.jpg'
  ];

  // Get current images based on screen size
  const images = isMobile ? mobileImages : desktopImages;

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (!sliderRef.current) return;

    const slides = sliderRef.current.querySelectorAll('.slide');
    
    // Reset current slide when switching between mobile/desktop
    setCurrentSlide(0);
    
    // Set initial state - all slides except first are translated to the right
    gsap.set(slides, { xPercent: 100, opacity: 0 });
    gsap.set(slides[0], { xPercent: 0, opacity: 1 });

    // Auto-slide functionality
    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 4000); // Changed to 4 seconds for faster auto-scroll
    };

    const stopAutoSlide = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startAutoSlide();

    return () => {
      stopAutoSlide();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [images.length, isMobile]); // Added isMobile to dependencies

  useEffect(() => {
    if (!sliderRef.current) return;

    const slides = sliderRef.current.querySelectorAll('.slide');
    const currentSlideEl = slides[currentSlide];
    const prevSlideIndex = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
    const prevSlideEl = slides[prevSlideIndex];

    // Animate slide transition
    const tl = gsap.timeline();

    // Move current slide out to the left
    tl.to(prevSlideEl, {
      xPercent: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // Move new slide in from the right
    tl.fromTo(currentSlideEl, 
      { xPercent: 100, opacity: 0 },
      { 
        xPercent: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.inOut' 
      }, 
      '-=0.4'
    );

    // Add subtle zoom effect to the current slide
    tl.fromTo(currentSlideEl.querySelector('img'), 
      { scale: 1.1 },
      { 
        scale: 1, 
        duration: 6,
        ease: 'power1.out' 
      }, 
      '-=0.8'
    );

  }, [currentSlide, images.length]);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Slider Container */}
      <div ref={sliderRef} className="relative w-full h-screen">
        {images.map((image, index) => (
          <div
            key={index}
            className="slide absolute inset-0 w-full h-full"
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
              style={{ transformOrigin: 'center center' }}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20 sm:bg-black/30"></div>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-1/2 transform -translate-y-1/2 left-4 z-20">
        <div className="flex flex-col space-y-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-8 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5 bg-white/20 z-20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ 
            width: `${((currentSlide + 1) / images.length) * 100}%` 
          }}
        />
      </div>

      {/* Content Overlay (Optional) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center translate-y-60">
        <div className="text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 sm:px-8 sm:py-4 bg-red-500 text-white rounded-lg font-semibold
                            hover:bg-transparent hover:border-2 hover:border-white hover:text-white 
                            transition-all duration-300 transform hover:scale-105
                            shadow-lg hover:shadow-xl">
              {t('joinUs')}
            </button>
            <button className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold
                            hover:bg-red-500 hover:text-white hover:border-0 transition-all duration-300 transform hover:scale-105">
              {t('learnMore')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;