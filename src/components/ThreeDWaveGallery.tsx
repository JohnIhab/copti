import React from "react";

const images = [
  "/Images/hero.jpg",
  "/Images/card/1.jpg",
  "/Images/card/2.jpg",
  "/Images/card/3.jpg",
  "/Images/card/4.jpg",
  "/Images/card/5.jpg",
  "/Images/card/11.jpg",
  "/Images/card/22.jpg",
  "/Images/card/33.jpg",
  "/Images/card/44.jpg",
  "/Images/card/55.jpg",
  "/Images/card/66.jpg",
  "/Images/services/1.jpg",
];

const ThreeDWaveGallery: React.FC = () => {
  return (
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
            style={{
              backgroundImage: `url(${src})`,
            }}
            className="item relative"
          />
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

    .item{
        width: calc(var(--index) * 3);
        height: calc(var(--index) * 12);
        background-color: #222;
        background-size: cover;
        background-position: center;
        cursor: pointer;
        filter: grayscale(.1) brightness(.6);
        transition: transform 1.25s var(--transition), filter 3s var(--transition), width 1.25s var(--transition);
        will-change: transform, filter, rotateY, width;
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
  );
};

export default ThreeDWaveGallery;
