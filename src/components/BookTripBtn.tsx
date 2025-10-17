import React, { useRef } from "react";
import { gsap } from "gsap";

const OrderButton: React.FC = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const defaultTextRef = useRef<HTMLSpanElement>(null);
  const successTextRef = useRef<HTMLSpanElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);

  const handleClick = () => {
    if (!buttonRef.current) return;

    const btn = buttonRef.current;
    if (btn.classList.contains("animate")) return;

    btn.classList.add("animate");

    const tl = gsap.timeline({
      onComplete: () => {
        btn.classList.remove("animate");
      },
    });

    // Hide default text
    tl.to(defaultTextRef.current, { opacity: 0, duration: 0.3 }, 0);

    // Truck move animation
    tl.to(
      truckRef.current,
      {
        x: -164,
        duration: 1.5,
        ease: "power2.inOut",
      },
      0.3
    )
      .to(truckRef.current, { x: -104, duration: 0.5 }, "+=0.2")
      .to(truckRef.current, { x: -224, duration: 0.8 }, "+=0.2")
      .to(truckRef.current, { x: 24, duration: 1.5 }, "+=0.4");

    // Box animation
    tl.fromTo(
      boxRef.current,
      { x: 0, opacity: 0 },
      {
        x: 40,
        opacity: 1,
        duration: 0.3,
        delay: 0.5,
      },
      0.5
    )
      .to(boxRef.current, { x: 112, duration: 0.5 }, "+=0.1")
      .to(boxRef.current, { opacity: 0, duration: 0.2 }, "+=0.05");

    // Lines animation
    tl.fromTo(
      linesRef.current,
      { opacity: 0, x: 0 },
      {
        opacity: 1,
        x: -400,
        duration: 2,
        ease: "power1.inOut",
      },
      0.8
    ).to(linesRef.current, { opacity: 0, duration: 0.3 }, "+=0.5");

    // Success text & check
    tl.to(successTextRef.current, { opacity: 1, duration: 0.4, delay: 6.5 }, 0);
    tl.to(
      checkRef.current,
      { strokeDashoffset: 0, duration: 0.3, delay: 7.3 },
      0
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="relative h-[63px] w-[240px] rounded-full bg-[#1C212E] overflow-hidden transition-transform duration-300 active:scale-95"
    >
      {/* Default text */}
      <span
        ref={defaultTextRef}
        className="absolute inset-x-0 top-[19px] text-center text-white text-[16px] font-medium"
      >
        احجز الرحلة
      </span>

      {/* Success text */}
      <span
        ref={successTextRef}
        className="absolute inset-x-0 top-[19px] text-center text-white text-[16px] font-medium opacity-0 flex items-center justify-center"
      >
        تم الحجز بنجاح
        <svg
          ref={checkRef}
          viewBox="0 0 12 10"
          className="w-[12px] h-[10px] ml-1 stroke-[#16BF78] stroke-2 fill-none"
          style={{
            strokeDasharray: "16px",
            strokeDashoffset: "16px",
          }}
        >
          <polyline
            points="1.5 6 4.5 9 10.5 1"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></polyline>
        </svg>
      </span>

      {/* Truck */}
      <div
        ref={truckRef}
        className="absolute left-full top-[11px] w-[60px] h-[41px] z-[1] translate-x-[24px]"
      >
        <div className="absolute left-0 top-0 w-[60px] h-[41px] bg-gradient-to-b from-white to-[#CDD9ED] rounded-sm"></div>

        <div className="absolute left-[60px] w-[26px] h-[41px] overflow-hidden rounded-r-lg bg-[#275EFE]">
          <div className="absolute left-[2px] top-0 w-[22px] h-[41px] bg-[#7699FF] rounded-r-lg"></div>
        </div>

        <div className="absolute left-[83px] top-[4px] w-[3px] h-[8px] bg-[#f0dc5f] rounded-sm"></div>
        <div className="absolute left-[83px] bottom-[4px] w-[3px] h-[8px] bg-[#f0dc5f] rounded-sm"></div>
      </div>

      {/* Box */}
      <div
        ref={boxRef}
        className="absolute right-full top-[21px] w-[21px] h-[21px] bg-gradient-to-b from-[#EDD9A9] to-[#DCB773] rounded-sm opacity-0"
      ></div>

      {/* Lines */}
      <div
        ref={linesRef}
        className="absolute top-[30px] left-full h-[3px] w-[6px] rounded bg-white shadow-[15px_0_0_white,30px_0_0_white,45px_0_0_white,60px_0_0_white,75px_0_0_white,90px_0_0_white,105px_0_0_white,120px_0_0_white,135px_0_0_white,150px_0_0_white,165px_0_0_white,180px_0_0_white,195px_0_0_white,210px_0_0_white,225px_0_0_white,240px_0_0_white,255px_0_0_white,270px_0_0_white,285px_0_0_white,300px_0_0_white,315px_0_0_white,330px_0_0_white]"
      ></div>
    </button>
  );
};

export default OrderButton;
