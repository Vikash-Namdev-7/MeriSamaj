import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

/**
 * CeremonySection — Displays Uthavna/Chautha/Pagdi details block.
 */
const CeremonySection = ({ funeralDetails, ceremonies }) => {
  const displayCeremonies = (ceremonies && ceremonies.length > 0)
    ? ceremonies
    : (funeralDetails ? [funeralDetails] : []);

  if (displayCeremonies.length === 0) return null;

  return (
    <div className="space-y-3">
      {displayCeremonies.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-4 border space-y-2"
          style={{
            background: 'linear-gradient(135deg, #FDF8F0 0%, #FEF3E2 100%)',
            borderColor: 'rgba(212,175,55,0.2)'
          }}
        >
          {/* Section title */}
          <h3
            className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between"
            style={{ color: '#7C5C2E' }}
          >
            <span>{item.type || 'Funeral / Ceremony'}</span>
            {displayCeremonies.length > 1 && (
              <span className="text-[10px] bg-amber-200/50 px-2 py-0.5 rounded-full text-amber-900">
                Program #{idx + 1}
              </span>
            )}
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
                {item.date || '—'}
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
                {item.time || '—'}
              </span>
              <span className="text-[10px] text-gray-500">Time</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.15)' }}
              >
                <MapPin size={16} style={{ color: '#7C5C2E' }} />
              </div>
              <span className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-1" title={item.venue}>
                {item.venue || '—'}
              </span>
              <span className="text-[10px] text-gray-500">Venue</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CeremonySection;
