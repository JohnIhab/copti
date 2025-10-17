
import React from 'react';
import { Calendar, MapPin, User } from 'lucide-react';

interface CardMeetingProps {
  title: string;
  time: string;
  day: string;
  location: string;
  description: string;
  organizer: string;
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
  organizer,
  image,
  onJoin
}) => {
  // Helper to format time as 12-hour with AM/PM
  const format12Hour = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const date = new Date();
    date.setHours(Number(h), Number(m));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="admin-card group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col w-[360px] h-[420px] ">
      <div className="relative">
        <img
          src={image || fallbackImage}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{day} - {format12Hour(time)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <span className="ml-2">{organizer}</span>
          </div>
        </div>
      </div>
    </div>
  );


};

export default CardMeeting;
