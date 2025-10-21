import React from 'react'
import Card3D from './card'
import { Link } from 'react-router-dom'

export default function Features() {
  return (
  <div className="min-h-screen bg-amber-50 dark:bg-gray-800 py-8 px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* Responsive grid for features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 justify-items-center">
          <div className="flex justify-center w-full">
            <Link to="/meetings" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-cartoon-church-3d-illustration-isolated-on-black-background-png-image_16700907.webp"
                title="مواعيد الأجتماعات"
                characterImage="https://cdn3d.iconscout.com/3d/premium/thumb/church-3d-icon-png-download-9041116.png"
              />
            </Link>
          </div>
          <div className="flex justify-center w-full">
            <Link to="/trips" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://png.pngtree.com/png-clipart/20250218/original/pngtree-3d-road-trip-traveler-icon-png-image_20463657.png"
                title="رحلات روحية"
                characterImage="https://png.pngtree.com/png-vector/20230902/ourmid/pngtree-tourist-couple-are-excited-to-go-to-travel-3d-character-illustration-png-image_9240564.png"
              />
            </Link>
          </div>
          <div className="flex justify-center w-full">
            <Link to="/read-bible" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://cdn3d.iconscout.com/3d/premium/thumb/bible-3d-icon-png-download-9882127.png"
                title="قراءة الكتاب المقدس"
                characterImage="https://cdn3d.iconscout.com/3d/premium/thumb/bible-book-5463305-4553207.png"
              />
            </Link>
          </div>
        </div>

        {/* Responsive grid for confession and events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 justify-items-center mt-28">
          <div className="flex justify-center w-full">
            <Link to="/confession" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXwn1yPbADUS1Pb_rzKN1Asmu6YS64wzUjhQ&s"
                title="حجز موعد أعتراف"
                characterImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ohFsPXKkjHnbnBlXgqk3bVeU14Xm7HtDtg&s"
              />
            </Link>
          </div>
          <div className="flex justify-center w-full">
            <Link to="/events" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://png.pngtree.com/png-clipart/20231006/original/pngtree-3d-concert-stage-png-image_13128551.png"
                title="فعاليات الكنيسة"
                characterImage="https://cdn3d.iconscout.com/3d/premium/thumb/event-3d-icon-png-download-8341547.png"
              />
            </Link>
          </div>
          <div className="flex justify-center w-full">
            <Link to="/news" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://copticorthodox.church/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-13-at-21.13.43.jpeg"
                title="الأخبار المسيحية"
                characterImage="https://copticorthodox.church/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-07-at-14.09.13.jpeg"
              />
            </Link>
          </div>
          {/* Empty grid cell for alignment on large screens */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </div>
  )
}
