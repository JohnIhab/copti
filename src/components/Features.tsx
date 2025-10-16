import React from 'react'
import Card3D from './card'
import { Link } from 'react-router-dom'

export default function Features() {
  return (
    <div className="min-h-screen bg-amber-50 py-8 px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center">
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
                characterImage="https://png.pngtree.com/png-vector/20231230/ourmid/pngtree-school-van-png-image_11390014.png"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 justify-items-center">
          <div className="flex justify-center w-full">
            <Link to="/confession" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://static.thenounproject.com/png/3462527-200.png"
                title="حجز موعد أعتراف"
                characterImage="https://png.pngtree.com/png-clipart/20230917/original/pngtree-an-icon-of-people-at-the-cross-or-church-with-the-png-image_12277174.png"
              />
            </Link>
          </div>
          <div className="flex justify-center w-full">
            <Link to="/events" className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
              <Card3D
                coverImage="https://i1.wp.com/www.light-dark.net/wp-content/uploads/2025/01/2018_4_8_10_47_37_884-561-1024x717.jpg"
                title="فعاليات الكنيسة"
                characterImage="https://i1.wp.com/www.light-dark.net/wp-content/uploads/2025/06/261_687_073740-461-1140x815.jpg"
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
