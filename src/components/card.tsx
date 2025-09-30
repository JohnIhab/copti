import React from "react";

interface Card3DProps {
    coverImage: string;
    title?: string;
    titleImage?: string;
    characterImage: string;
    width?: number;
    height?: number;
    isLarge?: boolean;
}

const Card3D: React.FC<Card3DProps> = ({
    coverImage,
    title,
    titleImage,
    characterImage,
    width,
    height,
    isLarge = false,
}) => {
    // Responsive sizing
    const getResponsiveSize = () => {
        if (isLarge) {
            return {
                width: width || 300,
                height: height || 400,
                className: "w-72 h-96 sm:w-80 sm:h-[26rem] lg:w-96 lg:h-[28rem]"
            };
        }
        return {
            width: width || 250,
            height: height || 300,
            className: "w-60 h-72 sm:w-64 sm:h-80 lg:w-72 lg:h-84"
        };
    };

    const { className } = getResponsiveSize();

    return (
        <div
            className={`relative flex justify-center items-end px-2 sm:px-4 lg:px-9 cursor-pointer group ${className}`}
            style={{ 
                perspective: '2500px'
            }}
        >
            {/* Wrapper */}
            <div 
                className="absolute w-full transition-all duration-500 group-hover:shadow-[2px_35px_32px_-8px_rgba(0,0,0,0.75)]"
                style={{
                    zIndex: -1,
                    transformStyle: 'preserve-3d'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(900px) translateY(-5%) rotateX(25deg) translateZ(0)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                }}
            >
                {/* Overlay gradients */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-all duration-500 bg-gradient-to-t from-[rgba(12,13,19,1)] via-[rgba(12,13,19,0.5)] to-transparent group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-full h-20 opacity-100 transition-all duration-500 bg-gradient-to-b from-[rgba(12,13,19,1)] via-[rgba(12,13,19,0.5)] to-transparent group-hover:h-32 group-hover:opacity-100"></div>
                
                <img
                    src={coverImage}
                    alt="cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Title */}
            {title ? (
                <div
                    className="w-full transition-transform duration-500 relative z-10 text-center mb-4"
                    style={{
                        transformStyle: 'preserve-3d'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translate3d(0%, -50px, 100px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold px-2 sm:px-4 py-1 sm:py-2 bg-black/50 rounded-lg backdrop-blur-sm">
                        {title}
                    </h2>
                </div>
            ) : titleImage ? (
                <img
                    src={titleImage}
                    alt="title"
                    className="w-full transition-transform duration-500 relative z-10"
                    style={{
                        transformStyle: 'preserve-3d'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translate3d(0%, -50px, 100px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                    }}
                />
            ) : null}

            {/* Character */}
            <img
                src={characterImage}
                alt="character"
                className="absolute w-full opacity-0 transition-all duration-500 group-hover:opacity-100"
                style={{
                    zIndex: -1,
                    transformStyle: 'preserve-3d'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate3d(0%, -30%, 100px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                }}
            />
        </div>
    );
};

export default Card3D;
