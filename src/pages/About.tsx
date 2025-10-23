
import { useEffect, useRef } from 'react';
import { choirs, awards, sundaySchools, oldChurch, newChurch } from './aboutData';
import gsap from 'gsap';
import Fathers from '../components/Fathers';
import ThreeDWaveGallery from '../components/ThreeDWaveGallery';
import InfiniteScoll from '../components/InfiniteScoll';
import {Helmet} from "react-helmet";

const sectionClass =
  'mb-12 p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700';

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

    <>
    <Helmet>
        <title>عن الكنيسة - كنيسة الأنبا رويس</title>
        <meta name="description" content="تعرف على دور وتميز كنيسة الأنبا رويس في المجتمع، بما في ذلك الكورالات، الجوائز، مدارس الأحد، وتاريخ الكنيسة القديم والجديد." />
        <meta name="keywords" content="كنيسة الأنبا رويس, دور الكنيسة, تميز الكنيسة, كورالات, جوائز الكنيسة, مدارس الأحد, تاريخ الكنيسة" />
        <meta name="author" content="كنيسة الأنيا رويس بكفر فرج" />
    </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-40" ref={containerRef}>
        {/* Section 1: Fathers */}
        <Fathers />

        {/* Section 2: Church Role & Distinction */}
        <section className={`${sectionClass} mt-12`}>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900 dark:text-blue-200">دور الكنيسة وتميزها في الإيبارشية</h2>
          <div className="mb-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">الكورالات في الكنيسة:</h3>
            <ul className="list-disc pr-6 space-y-1 text-blue-800 dark:text-blue-200">
              {choirs.map((choir, idx) => (
                <li key={idx}>{choir.name}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">جوائز حصل عليها أبناء الكنيسة:</h3>
            <ul className="list-disc pr-6 space-y-1 text-blue-800 dark:text-blue-200">
              {awards.map((award, idx) => (
                <li key={idx}>{award}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">مدارس الأحد والاجتماعات:</h3>
            <ul className="list-disc pr-6 space-y-1 text-blue-800 dark:text-blue-200">
              {sundaySchools.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <ThreeDWaveGallery className="hidden sm:block" />

        {/* Section 3: Old Church */}
        <section className={sectionClass}>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900 dark:text-blue-200">{oldChurch.title}</h2>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed text-justify">
            {oldChurch.content}
          </p>
        </section>

        {/* Section 4: New Church */}
        <section className={sectionClass}>
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900 dark:text-blue-200">{newChurch.title}</h2>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed text-justify">
            {newChurch.content}
          </p>
        </section>
        <div className="flex justify-center mt-8">
          <InfiniteScoll />
        </div>
      </div>
    </>
  );
}
