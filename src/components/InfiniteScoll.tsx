
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';


// import required modules
import { Pagination } from 'swiper/modules';
export default function InfiniteScoll() {
    // Example image filenames from public/Images/card/
    const images = [
        '/Images/card/33.jpg',
        '/Images/card/22.jpg',
        '/Images/card/44.jpg',
        '/Images/card/66.jpg',
        '/Images/card/55.jpg',
        '/Images/card/44.jpg',
        '/Images/card/22.jpg',
        '/Images/card/33.jpg',
        '/Images/card/44.jpg',
    ];
    return (
            <Swiper
                slidesPerView={3}
                spaceBetween={30}
                loop={true}
                breakpoints={{
                    0: { slidesPerView: 1 },
                    640: { slidesPerView: 3 }
                }}
                pagination={{
                    clickable: true,
                }}
                modules={[Pagination]}
                className="mySwiper"
            >
            {images.map((src, idx) => (
                <SwiperSlide key={idx}>
                    <img src={src} alt={`Card ${idx + 1}`} style={{ width: '100vw', height: '80vh', borderRadius: '12px' }} />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
