
import { useEffect, useRef } from 'react';
import { choirs, awards, sundaySchools, oldChurch, newChurch } from './aboutData';
import gsap from 'gsap';
import Fathers from '../components/Fathers';
import CherchRole from '../components/CherchRole';
import ThreeDWaveGallery from '../components/ThreeDWaveGallery';

const sectionClass =
  'mb-12 p-6 bg-white/80 rounded-xl shadow-lg border border-gray-200';

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.25,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  return (
    
    <div className="max-w-4xl mx-auto px-4 py-10 mt-24" ref={containerRef}>
      {/* Section 1: Fathers */}
      <Fathers />

      {/* Section 2: Church Role & Distinction */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">دور الكنيسة وتميزها في الإيبارشية</h2>
        <div className="mb-4">
          <h3 className="font-semibold text-blue-700 mb-2">الكورالات في الكنيسة:</h3>
          <ul className="list-disc pr-6 space-y-1 text-blue-800">
            {choirs.map((choir, idx) => (
              <li key={idx}>{choir.name}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-blue-700 mb-2">جوائز حصل عليها أبناء الكنيسة:</h3>
          <ul className="list-disc pr-6 space-y-1 text-blue-800">
            {awards.map((award, idx) => (
              <li key={idx}>{award}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-blue-700 mb-2">مدارس الأحد والاجتماعات:</h3>
          <ul className="list-disc pr-6 space-y-1 text-blue-800">
            {sundaySchools.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      
      <ThreeDWaveGallery />

      {/* Section 3: Old Church */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">{oldChurch.title}</h2>
        <p className="text-gray-800 whitespace-pre-line leading-relaxed text-justify">
          {oldChurch.content}
        </p>
      </section>

      {/* Section 4: New Church */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">{newChurch.title}</h2>
        <p className="text-gray-800 whitespace-pre-line leading-relaxed text-justify">
          {newChurch.content}
        </p>
      </section>
    </div>
  );
}
