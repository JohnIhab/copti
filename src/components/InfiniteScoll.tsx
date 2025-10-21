
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import 'swiper/css/pagination';


// import required modules
import { Pagination } from 'swiper/modules';
export default function InfiniteScoll() {
    // Example image filenames from public/Images/card/
    const images = [
        '/Images/cherch/1.jpg',
        '/Images/cherch/2.jpg',
        '/Images/cherch/3.jpg',
        '/Images/cherch/4.jpg',
        '/Images/cherch/5.jpg',
        '/Images/cherch/6.jpg',
        '/Images/cherch/7.jpg',
        '/Images/cherch/8.jpg',
        '/Images/cherch/9.jpg',
        '/Images/cherch/10.jpg',
        '/Images/cherch/11.JPG',
        '/Images/cherch/12.JPG',
        '/Images/cherch/13.JPG',
        '/Images/cherch/14.JPG',
        '/Images/cherch/15.JPG',
        '/Images/cherch/16.JPG',
    ];
    return (
        <Swiper
            slidesPerView={3}
            spaceBetween={30}
            modules={[Navigation, Pagination]}
            navigation={true}
            loop={true}
            breakpoints={{
                0: { slidesPerView: 1 },
                640: { slidesPerView: 3 }
            }}
            pagination={{
                clickable: true,
            }}
            className="mySwiper"
        >
            {images.map((src, idx) => (
                <SwiperSlide key={idx}>
                    <img src={src} alt={`Card ${idx + 1}`} loading="lazy" decoding="async" fetchPriority="low" style={{ width: '100vw', height: '80vh', borderRadius: '12px' }} />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
