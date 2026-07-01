import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

/**
 * CeremonySection — Displays Uthavna/Chautha/Pagdi details block.
 */
const CeremonySection = ({ funeralDetails }) => {
  if (!funeralDetails) return null;

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: 'linear-gradient(135deg, #FDF8F0 0%, #FEF3E2 100%)',
        borderColor: 'rgba(212,175,55,0.2)'
      }}
    >
      {/* Section title */}
      <h3
        className="text-[13px] font-bold uppercase tracking-wider mb-3"
        style={{ color: '#7C5C2E' }}
      >
        {funeralDetails.type || 'Funeral / Ceremony'}
      </h3>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)' }}
          >
            <Calendar size={16} style={{ color: '#7C5C2E' }} />
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-tight">
            {funeralDetails.date}
          </span>
          <span className="text-[10px] text-gray-500">Date</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)' }}
          >
            <Clock size={16} style={{ color: '#7C5C2E' }} />
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-tight">
            {funeralDetails.time}
          </span>
          <span className="text-[10px] text-gray-500">Starts At</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)' }}
          >
            <MapPin size={16} style={{ color: '#7C5C2E' }} />
          </div>
          <span className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2">
            {funeralDetails.venue?.split(',')[0]}
          </span>
          <span className="text-[10px] text-gray-500 line-clamp-1">
            {funeralDetails.venue?.split(',').slice(1).join(',').trim() || 'Venue'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CeremonySection;
