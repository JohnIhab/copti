import React, { useState } from "react";

// Minimal MotionSection shim so the provided markup works without adding framer-motion.
// It simply renders a section and forwards props. Types are kept permissive.
const MotionSection: React.FC<any> = ({ children, className, ...props }) => {
    return (
        <section className={className} {...props}>
            {children}
        </section>
    );
};

// Minimal fadeIn stub used in the original markup. It's a no-op placeholder.
const fadeIn = (_dir: string, _delay = 0) => ({ hidden: {}, show: {} });

const ImageGallery: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Images are served from the `public/Images/card` folder. Vite serves `public` at root.
    const images = [
        { src: "/Images/services/1.jpg"},
        { src: "/Images/services/2.jpg"},
        { src: "/Images/services/3.jpg"}
    ];

    return (
        <>
            <section id="About" className="py-[24px] p-4 root lg:hidden">
                <div className="container mx-auto mb-3">

                    <div className="mt-8 grid grid-cols-1 gap-3">
                        {images.map((item, index) => (
                            <div key={index} className="h-[220px] rounded-2xl overflow-hidden relative">
                                <img className="h-full w-full object-cover" src={item.src} alt={`service-${index}`} />
                                
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Desktop/large screens (with animation/hover) */}
            <MotionSection
                id="About"
                variants={fadeIn("down", 0.2)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0 }}
                className="root hidden lg:block"
            >
                <div className="container mx-auto max-w-7xl mb-3  cursor-pointer">


                    <div className="container mx-auto flex w-full items-center flex-col lg:flex-row gap-x-3 gap-y-3 list-image mt-8 ">
                        {images.map((item, index) => (
                            <div
                                key={index}
                                onMouseOver={() => {
                                    setActiveIndex(index);
                                }}
                                className={`flex-1 h-[2000px] lg:h-[500px] rounded-2xl cursor-pointer overflow-hidden relative transition-all duration-500 ease-in-out delay-150 ${
                                    activeIndex === index ? "active" : ""
                                    }`}
                            >
                                <img className="overflow-hidden h-full w-full object-cover" src={item.src} alt={`car${index}`} />
                                
                            </div>
                        ))}
                    </div>
                </div>
            </MotionSection>
        </>
    );
};

export default ImageGallery;
