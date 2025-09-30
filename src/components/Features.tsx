import React from 'react'
import Card3D from './card'

export default function Features() {
  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Grid layout for responsive design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="flex justify-center">
            <Card3D
              coverImage="https://png.pngtree.com/png-vector/20250705/ourmid/pngtree-cartoon-church-3d-illustration-isolated-on-black-background-png-image_16700907.webp"
              title="مواعيد الأجتماعات"
              characterImage="https://cdn3d.iconscout.com/3d/premium/thumb/church-3d-icon-png-download-9041116.png"
            />
          </div>
          <div className="flex justify-center">
            <Card3D
              coverImage="https://png.pngtree.com/png-clipart/20250218/original/pngtree-3d-road-trip-traveler-icon-png-image_20463657.png"
              title="رحلات روحية"
              characterImage="https://png.pngtree.com/png-vector/20231230/ourmid/pngtree-school-van-png-image_11390014.png"
            />
          </div>
          <div className="flex justify-center">
            <Card3D
              coverImage="https://cdn3d.iconscout.com/3d/premium/thumb/bible-3d-icon-png-download-9882127.png"
              title="قراءة الكتاب المقدس"
              characterImage="https://cdn3d.iconscout.com/3d/premium/thumb/bible-book-5463305-4553207.png"
            />
          </div>
        </div>
        
        {/* Centered card for confession */}
        <div className="flex justify-center">
          <Card3D
            coverImage="https://static.thenounproject.com/png/3462527-200.png"
            title="حجز موعد أعتراف"
            characterImage="https://png.pngtree.com/png-clipart/20230917/original/pngtree-an-icon-of-people-at-the-cross-or-church-with-the-png-image_12277174.png"
          />
        </div>
      </div>
    </div>
  )
}
