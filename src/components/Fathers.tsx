
import React, { useRef } from 'react';

import bolesImg from '../../public/Images/fathers/بولس.jpeg';
import abdelmalekImg from '../../public/Images/fathers/سمعان عبدالملك.png';
import shahhatImg from '../../public/Images/fathers/سمعان الشحات.jpeg';
import barnabaImg from '../../public/Images/card/5.jpg';

const slides = [
    {
        img: bolesImg,
        name: 'أبونا المتنيح القمص / بولس كامل بشاي',
        desc: 'Renowned for its breathtaking Alpine scenery and precision in craftsmanship',
    },
    {
        img: abdelmalekImg,
        name: 'أبونا المتنيح القمص / سمعان عبد الملاك',
        desc: 'Known for its saunas, lakes, and a deep connection to nature',
    },
    {
        img: shahhatImg,
        name: 'أبونا المتنيح القمص /سمعان الشحات عبد المسيح',
        desc: 'Famous for its rich culture, historical landmarks, natural beauty, and diverse cuisine',
    },
    {
        img: barnabaImg,
        name: 'أبونا القس / برنابا سليمان',
        desc: 'الأب الراعي للكنيسة الأن',
    }
];

export default function Fathers() {
    const slideRef = useRef<HTMLDivElement>(null);

    const nextSlide = () => {
        if (!slideRef.current) return;
        const first = slideRef.current.children[0];
        slideRef.current.appendChild(first);
    };

    const prevSlide = () => {
        if (!slideRef.current) return;
        const last = slideRef.current.children[slideRef.current.children.length - 1];
        slideRef.current.prepend(last);
    };

    return (
        <div className="slider-main" style={{ position: 'relative',left: '-1rem', top: '-3rem', zIndex: 1, width: '100%', margin: 0, padding: 0 }}>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
            <style>{`
        .slider-slider-container { position: relative; width: 75vw; height: 85vh; border-radius: 0; background: #f5f5f5; box-shadow: 0 30px 50px #dbdbdb; }
    @media (max-width: 768px) { .slider-slider-container { height: 83vh; box-shadow: 0 15px 25px #dbdbdb; width: 93vw; } .slider-main { left: 0 !important; } }
        .slider-slider-container .slider-slide .slider-item { width: 200px; height: 300px; position: absolute; top: 50%; transform: translate(0, -50%); border-radius: 20px; box-shadow: 0 30px 50px #505050; display: inline-block; transition: 0.5s; overflow: hidden; }
        @media (max-width: 768px) { .slider-slider-container .slider-slide .slider-item { box-shadow: none; width: 150px; height: 200px; } }
  .slider-item img { width: 100%; height: 100%; object-fit: contain; border-radius: 20px; background-color: aliceblue; transition: transform 0.3s ease-in-out; }
        .slider-item:hover img { transform: scale(1.05); }
        .slider-slide .slider-item:nth-child(1), .slider-slide .slider-item:nth-child(2) { top: 0; left: 0; transform: translate(0, 0); border-radius: 0; width: 100%; height: 100%; border-radius: 15px; }
        .slider-slide .slider-item:nth-child(2) .slider-content { display: block; }
        .slider-slide .slider-item:nth-child(3) img, .slider-slide .slider-item:nth-child(4) img, .slider-slide .slider-item:nth-child(5) img, .slider-slide .slider-item:nth-child(n + 6) img { background: transparent !important; backdrop-filter: blur(4px); }
        .slider-slide .slider-item:nth-child(3) { left: 50%; top: 70%; transform: translate(40%, -70%); }
        .slider-slide .slider-item:nth-child(4) { left: calc(50% + 220px); top: 70%; transform: translate(40%, -70%); }
        .slider-slide .slider-item:nth-child(5) { left: calc(50% + 440px); top: 70%; transform: translate(40%, -70%); }
        .slider-slide .slider-item:nth-child(n + 6) { left: calc(50% + 440px); top: 70%; transform: translate(40%, -70%); overflow: hidden; }
        @media (max-width: 768px) { .slider-item img { transform: scale(1.4); } .slider-slide .slider-item:nth-child(3) { left: 50%; top: 75%; transform: translate(20%, -75%); } .slider-slide .slider-item:nth-child(4) { left: calc(50% + 170px); top: 75%; transform: translate(20%, -75%); } .slider-slide .slider-item:nth-child(5) { left: calc(50% + 340px); top: 75%; transform: translate(20%, -75%); } .slider-slide .slider-item:nth-child(n + 6) { left: calc(50% + 340px); top: 75%; transform: translate(20%, -75%); } }
        .slider-item .slider-content { position: absolute; top: 70%; left: 100px; max-width: 450px; text-align: left; color: #fff; transform: translate(0, -50%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: none; font-size: 20px; background: #fffcfc54; padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        @media (max-width: 768px) { .slider-item .slider-content { left: 20px; width: 158px; font-size: 14px; padding: 20px 15px; backdrop-filter: blur(8px); transform: translate(28px, 39px); background: #fffcfc54; } }
        @media (max-width: 480px) { .slider-item .slider-content { left: 15px; width: 158px; font-size: 16px; padding: 15px 12px; backdrop-filter: blur(6px); transform: translate(28px, 39px); background: #fffcfc54; } }
        .slider-content .slider-name { font-size: 42px; text-transform: uppercase; font-weight: 700; opacity: 0; animation: animate 1s ease-in-out 1 forwards; background: linear-gradient(135deg, #05A490, #004f45); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); letter-spacing: 2px; line-height: 1.2; margin-bottom: 15px; }
        @media (max-width: 768px) { .slider-content .slider-name { font-size: 30px; letter-spacing: 1.5px; margin-bottom: 12px; } }
        @media (max-width: 480px) { .slider-content .slider-name { font-size: 26px; letter-spacing: 1px; margin-bottom: 10px; } }
        .slider-content .slider-description { margin-top: 10px; margin-bottom: 25px; opacity: 0; animation: animate 1s ease-in-out 0.3s 1 forwards; font-size: 16px; line-height: 1.6; font-weight: 400; color: black; text-shadow: 1px 1px 2px rgba(0,0,0,0.7); letter-spacing: 0.5px; }
        .slider-content button { padding: 12px 24px; border: none; cursor: pointer; opacity: 0; animation: animate 1s ease-in-out 0.6s 1 forwards; background: linear-gradient(135deg, #05A490, #03695d); color: white; border-radius: 25px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,123,255,0.4); }
        .slider-content button:hover { background: linear-gradient(135deg, #03695d, #05A490); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,123,255,0.6); }
        @media (max-width: 768px) { .slider-content button { padding: 10px 20px; font-size: 12px; letter-spacing: 0.8px; } .slider-content .slider-description { font-size: 14px; line-height: 1.5; margin-bottom: 20px; color: black; } .slider-content .slider-name { background: linear-gradient(135deg, #05A490, #004f45); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; } }
        @media (max-width: 480px) { .slider-content button { padding: 8px 16px; font-size: 11px; letter-spacing: 0.6px; } .slider-content .slider-description { font-size: 13px; line-height: 1.4; margin-bottom: 18px; color: black; } .slider-content .slider-name { background: linear-gradient(135deg, #05A490, #004f45); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; } }
        @keyframes animate { from { opacity: 0; transform: translate(0, 100px); filter: blur(33px); } to { opacity: 1; transform: translate(0); filter: blur(0); } }
        @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .slider-content .slider-name { animation: slideInFromLeft 1.2s ease-out 0.2s forwards; }
        .slider-content .slider-description { animation: fadeInUp 1s ease-out 0.5s forwards; }
        .slider-content button { animation: scaleIn 0.8s ease-out 0.8s forwards; }
        .button { width: 100%; text-align: center; position: absolute; bottom: 20px; }
    .button button { width: 40px; height: 35px; border-radius: 8px; border: none; cursor: pointer; margin: 0 5px; border: 1px solid #000; transition: 0.3s; background: #05A490; color: #fff; }
        .button button:hover { background: #ababab; color: #fff; }
        @media (max-width: 768px) { .button { bottom: 15px; } .button button { width: 35px; height: 30px; margin: 0 3px; } }
        @media (max-width: 480px) { .button { bottom: 10px; } .button button { width: 30px; height: 25px; margin: 0 2px; } .button button i { font-size: 12px; } }
        @media (max-width: 768px) { .slider-main { padding: 0; } .button button { min-height: 44px; min-width: 44px; touch-action: manipulation; } .slider-slide .slider-item:nth-child(n + 5) { display: none; } }
        @media (max-width: 480px) { .slider-slide .slider-item:nth-child(n + 4) { display: none; } .slider-slide .slider-item:nth-child(3) { left: 60%; transform: translate(10%, -75%); } }
        @media (max-width: 768px) { body { overflow-x: hidden; } }
        
        @media (max-width: 768px) { .slider-content .slider-name::after { width: 40px; height: 2px; margin: 8px 0; } }
        @media (max-width: 480px) { .slider-content .slider-name::after { width: 35px; height: 2px; margin: 6px 0; } }
        .slider-content::selection { background: rgba(0,123,255,0.3); color: white; }
        .slider-content *::selection { background: rgba(0,123,255,0.3); color: white; }
        .slider-content button:focus { outline: 2px solid rgba(255,255,255,0.8); outline-offset: 2px; }
      `}</style>
            <div className="slider-slider-container">
                <div className="slider-slide" ref={slideRef} >
                    {slides.map((slide, idx) => (
                        <div className="slider-item" key={idx}>
                            <img src={slide.img} alt={slide.name} style={{objectFit: 'cover'}}/>
                            <div className="slider-content">
                                <div className="slider-name text-center">{slide.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="button">
                    <button className="prev" onClick={prevSlide}><i className="fa-solid fa-arrow-left"></i></button>
                    <button className="next" onClick={nextSlide}><i className="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
    );
}