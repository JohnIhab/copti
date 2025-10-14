
import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CardMeetingProps {
  title: string;
  time: string;
  day: string;
  location: string;
  description: string;
  category: string;
  capacity: number;
  registered: number;
  image?: string;
  onJoin?: () => void;
}

const fallbackImage = '/Images/hero.jpg';

const CardMeeting: React.FC<CardMeetingProps> = ({
  title,
  time,
  day,
  location,
  description,
  category,
  capacity,
  registered,
  image,
}) => {
  return (
  <div className="admin-card bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col w-[360px] h-[480px]">
      <div className="relative">
        <img
          src={image || fallbackImage}
          alt={title}
          className="w-full h-48 object-contain"
          onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{day} - {time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{registered}/{capacity}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            {category}
          </span>
          
        </div>
      </div>
    </div>
  );
};

export default CardMeeting;
