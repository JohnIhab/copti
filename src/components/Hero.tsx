import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Heart, Users, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!titleRef.current) return;

    const tl = gsap.timeline();

    // Set initial states
    gsap.set([titleRef.current, subtitleRef.current, descriptionRef.current, buttonsRef.current], {
      opacity: 0,
      y: 50,
    });

    gsap.set(statsRef.current, {
      opacity: 0,
      y: 30,
    });

    // Animate elements in sequence
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    })
    .to(subtitleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5')
    .to(descriptionRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.4')
    .to(buttonsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.4')
    .to(statsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.4');

    // Parallax effect for background
    gsap.to(heroRef.current, {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        ref={heroRef}
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 
          ref={titleRef}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
        >
          {t('heroTitle')}
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl sm:text-2xl lg:text-3xl mb-6 text-blue-100 font-semibold"
        >
          {t('heroSubtitle')}
        </p>
        
        <p 
          ref={descriptionRef}
          className="text-lg sm:text-xl mb-8 text-blue-50 max-w-2xl mx-auto leading-relaxed"
        >
          {t('heroDescription')}
        </p>
        
        <div 
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button className="px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold
                           hover:bg-gray-100 transition-all duration-300 transform hover:scale-105
                           shadow-lg hover:shadow-xl">
            {t('joinUs')}
          </button>
          <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold
                           hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105">
            {t('learnMore')}
          </button>
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-red-300" />
            <div className="text-2xl font-bold">500+</div>
            <div className="text-blue-100">أعضاء العائلة</div>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-300" />
            <div className="text-2xl font-bold">50+</div>
            <div className="text-blue-100">خدام</div>
          </div>
          <div className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
            <div className="text-2xl font-bold">25+</div>
            <div className="text-blue-100">سنة خدمة</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white" />
      </div>
    </section>
  );
};

export default Hero;