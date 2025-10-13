import { Link } from 'react-router-dom';
// ...existing code...
import { useEffect, useRef } from 'react';
import { Church } from 'lucide-react';

const NotFound: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.classList.add('show');
        }

        // When this page is active make navigation text white for better contrast
        document.body.classList.add('notfound-mode');
        return () => {
            document.body.classList.remove('notfound-mode');
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
            <div
                ref={containerRef}
                className="max-w-3xl p-8 text-center opacity-0 translate-y-8 transition-all duration-700 ease-out"
            >
                <div className="mb-8">
                    <svg className="mx-auto w-64 h-64" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <defs>
                            <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stopColor="#60A5FA" />
                                <stop offset="100%" stopColor="#7C3AED" />
                            </linearGradient>
                            <linearGradient id="text-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#60A5FA" />
                            </linearGradient>
                        </defs>

                        {/* planet */}
                        <g transform="translate(100,90)">
                            <circle cx="0" cy="0" r="40" fill="url(#g)" className="planet" />
                            {/* ring */}
                            <ellipse cx="0" cy="10" rx="52" ry="18" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" transform="rotate(-20)" />
                            {/* satellite orbiting */}
                            <g className="satellite-orbit">
                                <circle cx="70" cy="-10" r="6" fill="#FDE68A" className="satellite" />
                            </g>
                        </g>

                        {/* stars */}
                        <g>
                            <circle cx="30" cy="30" r="2" fill="#FFF" opacity="0.9" />
                            <circle cx="170" cy="40" r="1.6" fill="#FFF" opacity="0.8" />
                            <circle cx="40" cy="150" r="1.8" fill="#FFF" opacity="0.85" />
                            <circle cx="150" cy="20" r="1.5" fill="#FFF" opacity="0.7" />
                        </g>

                        {/* Cherch wordmark with animated stroke */}
                        <g transform="translate(100,200)">
                            <text
                                x="0"
                                y="0"
                                textAnchor="middle"
                                fontSize="38"
                                fontFamily="'Segoe UI', 'Arial', sans-serif"
                                fill="none"
                                stroke="url(#text-gradient)"
                                strokeWidth="2.2"
                                className="cherch-stroke w-full"
                            >الأنبا رويس</text>
                            <text
                                x="0"
                                y="0"
                                textAnchor="middle"
                                fontSize="38"
                                fontFamily="'Segoe UI', 'Arial', sans-serif"
                                fill="url(#text-gradient)"
                                opacity="0.7"
                                className="cherch-fill w-full"
                            >الأنبا رويس</text>
                        </g>
                    </svg>
                </div>

                <h1 className="text-6xl font-extrabold mb-4">404</h1>
                <p className="text-xl mb-6">للأسف لم نتمكن من العثور على هذه الصفحة.</p>

                <div className="text-center">
                    <div className="relative">
                        <Church className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400 animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                            <Church className="h-16 w-16 mx-auto text-blue-600/20 dark:text-blue-400/20" />
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-1 justify-center">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>

                    <div className="flex gap-4 justify-center mt-6">
                        <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">الرئيسية</Link>
                        <Link to="/contact" className="px-4 py-2 border border-gray-500 text-white rounded-md">تواصل معنا</Link>
                    </div>
                </div>

                <style>{`
          .planet { transform-origin: center; animation: float 4s ease-in-out infinite; }
          .satellite-orbit { transform-origin: 100px 90px; animation: spin 6s linear infinite; }
          .satellite { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); }

          /* Cherch wordmark stroke animation */
          .cherch-stroke {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: draw-stroke 2.2s cubic-bezier(.77,0,.18,1) 0.5s forwards, pulse 2.5s 2.7s infinite alternate;
          }
          .cherch-fill {
            animation: pulse 2.5s 2.7s infinite alternate;
          }

          @keyframes draw-stroke {
            to { stroke-dashoffset: 0; }
          }
          @keyframes pulse {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
          }

          @keyframes float {
            0% { transform: translateY(0) }
            50% { transform: translateY(-8px) }
            100% { transform: translateY(0) }
          }
          @keyframes spin {
            0% { transform: rotate(0deg) }
            100% { transform: rotate(360deg) }
          }

          /* Fade-in and up for main content */
          .show {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        `}</style>
            </div>
        </div>
    );
};

export default NotFound;
