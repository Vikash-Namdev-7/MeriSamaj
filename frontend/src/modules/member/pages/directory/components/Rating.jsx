import { Star } from 'lucide-react';

const Rating = ({ rating = 4.9, reviewCount = 120 }) => {
  return (
    <div className="flex items-center gap-1.5">
      {/* 5 Stars display */}
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star - rating <= 0.5
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Numeric score */}
      <span className="text-xs font-bold text-slate-800">
        {Number(rating).toFixed(1)}
      </span>

      {/* Review Count */}
      <span className="text-[11px] font-medium text-slate-400">
        ({reviewCount})
      </span>
    </div>
  );
};

export default Rating;
