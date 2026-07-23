import { useState } from 'react';
import { Phone, Share2, Bookmark, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessActions = ({ phone, onCall, onShare, onBookmark, onViewDetails }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark(!isBookmarked);
  };

  const handleCallClick = (e) => {
    e.stopPropagation();
    if (onCall) onCall();
    else if (phone) window.location.href = `tel:${phone}`;
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) onShare();
    else if (navigator.share) {
      navigator.share({ title: 'Business Listing', url: window.location.href });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Call Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleCallClick}
        title="Call Business"
        aria-label="Call Business"
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100/80 flex items-center justify-center transition-colors shadow-xs"
      >
        <Phone className="w-4.5 h-4.5 stroke-[2]" />
      </motion.button>

      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleShareClick}
        title="Share"
        aria-label="Share Business"
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center transition-colors shadow-xs"
      >
        <Share2 className="w-4.5 h-4.5 stroke-[2]" />
      </motion.button>

      {/* Bookmark Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleBookmarkClick}
        title="Bookmark"
        aria-label="Bookmark Business"
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] border flex items-center justify-center transition-colors shadow-xs ${
          isBookmarked
            ? 'bg-[#5B5CEB] text-white border-[#5B5CEB]'
            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/60'
        }`}
      >
        <Bookmark
          className={`w-4.5 h-4.5 stroke-[2] ${
            isBookmarked ? 'fill-white' : ''
          }`}
        />
      </motion.button>

      {/* View Details Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onViewDetails}
        title="View Details"
        aria-label="View Details"
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-[#5B5CEB] text-white hover:bg-[#4b4cdb] shadow-sm border border-[#5B5CEB] flex items-center justify-center transition-colors"
      >
        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
      </motion.button>
    </div>
  );
};

export default BusinessActions;
