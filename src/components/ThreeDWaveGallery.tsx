import React from "react";

const images = [
  '/Images/old/1.jpg',
  '/Images/old/2.jpg',
  '/Images/old/3.jpg',
  '/Images/old/4.jpg',
  '/Images/old/5.jpg',
  '/Images/old/6.jpg',
  '/Images/old/7.jpg',
  '/Images/old/8.jpg',
  '/Images/old/9.jpg',
  '/Images/old/10.jpg',
  '/Images/old/11.jpg',
  '/Images/old/12.jpg',
  '/Images/old/13.jpg',
];

interface ThreeDWaveGalleryProps {
  className?: string;
}

const ThreeDWaveGallery: React.FC<ThreeDWaveGalleryProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2 className="gallery-title" dir="rtl">صور الهدم لبناء الكنيسة الحالية</h2>
      <div className="wrapper">
        <div
          className="items"
          style={{
            ["--index" as any]: "calc(1vw + 1vh)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              tabIndex={0}
              className="item relative"
            >
              <img
                src={src}
                alt={`صور ${i + 1}`}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>
          ))}
        </div>
        <style>{`
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root{
    --index: calc(1vw + 1vh);
    --transition: cubic-bezier(.1, .7, 0, 1);
}

body{
    // background-color: #282A36;
}

    .wrapper{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60vh;
    }

    .items{
        display: flex;
        gap: 0.4rem;
        perspective: calc(var(--index) * 35);
    }

  .gallery-title{
    font-size: calc(1.2rem + 1vw);
    text-align: center;
    margin-bottom: 1rem;
    direction: rtl;
    font-weight: 600;
  }

  .item{
    width: calc(var(--index) * 3);
    height: calc(var(--index) * 12);
    background-color: #222;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    filter: grayscale(.1) brightness(.6);
    transition: transform 1.25s var(--transition), filter 3s var(--transition), width 1.25s var(--transition);
    will-change: transform, filter, rotateY, width;
  }

  .item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform-origin: center;
    transition: inherit;
  }

    /* Responsive styles */
    @media (max-width: 900px) {
      .wrapper {
        height: 40vh;
      }
      .item {
        width: calc(var(--index) * 2.2);
        height: calc(var(--index) * 8.5);
      }
      .items .item:active, .items .item:focus {
        width: 45vw;
      }
    }
    @media (max-width: 600px) {
      .wrapper {
        height: 28vh;
      }
      .item {
        width: calc(var(--index) * 1.3);
        height: calc(var(--index) * 5.5);
      }
      .items .item:active, .items .item:focus {
        width: 70vw;
      }
    }
    @media (max-width: 400px) {
      .wrapper {
        height: 18vh;
      }
      .item {
        width: calc(var(--index) * 0.9);
        height: calc(var(--index) * 3.5);
      }
      .items .item:active, .items .item:focus {
        width: 90vw;
      }
    }

.item::before, .item::after{
    content: '';
    position: absolute;
    height: 100%;
    width: 20px;
    right: calc(var(--index) * -1);
}

.item::after{
    left: calc(var(--index) * -1);
}

.items .item:hover{
    filter: inherit;
    transform: translateZ(calc(var(--index) * 10));
}

/*Right*/

.items .item:hover + *{
    filter: inherit;
    transform: translateZ(calc(var(--index) * 8.5)) rotateY(35deg);
    z-index: -1;
}

.items .item:hover + * + *{
    filter: inherit;
    transform: translateZ(calc(var(--index) * 5.6)) rotateY(40deg);
    z-index: -2;
}

.items .item:hover + * + * + *{
    filter: inherit;
    transform: translateZ(calc(var(--index) * 2.5)) rotateY(30deg);
    z-index: -3;
}

.items .item:hover + * + * + * + *{
    filter: inherit;
    transform: translateZ(calc(var(--index) * .6)) rotateY(15deg);
    z-index: -4;
}


/*Left*/

.items .item:has( + :hover){
    filter: inherit;
    transform: translateZ(calc(var(--index) * 8.5)) rotateY(-35deg);
}

.items .item:has( + * + :hover){
    filter: inherit;
    transform: translateZ(calc(var(--index) * 5.6)) rotateY(-40deg);
}

.items .item:has( + * + * + :hover){
    filter: inherit;
    transform: translateZ(calc(var(--index) * 2.5)) rotateY(-30deg);
}

.items .item:has( + * + * + * + :hover){
    filter: inherit;
    transform: translateZ(calc(var(--index) * .6)) rotateY(-15deg);
}

.items .item:active, .items .item:focus {
    width: 28vw;
    filter: inherit;
    z-index: 100;
    transform: translateZ(calc(var(--index) * 10));
    margin: 0 .45vw;
}
      `}</style>
      </div>
    </div>
  );
};

export default ThreeDWaveGallery;
