import React from 'react';
import { Heart, Quote } from 'lucide-react';

/**
 * SuccessStoryCard — Testimonial card showing a community success story.
 */
const SuccessStoryCard = ({ story }) => {
  if (!story) return null;

  return (
    <div className="bg-white rounded-2xl border border-rose-100/60 shadow-[0_2px_12px_rgba(244,63,94,0.06)] overflow-hidden min-w-[280px] max-w-[320px] snap-center shrink-0">
      {/* Couple Photo */}
      <div className="relative h-40 bg-gradient-to-br from-rose-100 to-purple-50 overflow-hidden">
        <img
          src={story.avatar}
          alt={story.groomName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-400" fill="currentColor" />
            <h4 className="text-[14px] font-extrabold text-white truncate">{story.groomName}</h4>
          </div>
          <p className="text-[10.5px] text-white/80 font-semibold mt-0.5">
            {story.location} · {story.marriageDate}
          </p>
        </div>
      </div>

      {/* Quote */}
      <div className="p-4 relative">
        <Quote size={18} className="text-rose-200 absolute top-3 right-3" />
        <p className="text-[12px] text-slate-600 leading-relaxed font-medium line-clamp-3 italic">
          "{story.quote}"
        </p>
      </div>
    </div>
  );
};

export default SuccessStoryCard;
