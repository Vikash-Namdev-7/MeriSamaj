import { CheckCircle, Phone, MapPin, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TagChip from './TagChip';

const BusinessCard = ({ business, onClick }) => {
  const {
    title,
    category,
    city,
    initials,
    phone,
    verified = true,
    logo,
    color = 'bg-slate-100 text-slate-700 font-black border border-slate-200/80',
  } = business;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative w-full rounded-[24px] bg-white border border-slate-200/80 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(124,58,237,0.08)] hover:border-purple-200 transition-all duration-300 cursor-pointer flex items-center justify-between gap-3.5"
    >
      {/* LEFT & MIDDLE SECTION */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Business Image / Logo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] overflow-hidden shadow-xs border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
          {logo ? (
            <img
              src={logo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center font-black text-lg sm:text-xl ${color} group-hover:scale-108 transition-transform duration-500`}
            >
              {initials || title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Middle Details */}
        <div className="space-y-1 min-w-0 flex-1 text-left">
          {/* Line 1: Title & Verified Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 group-hover:text-purple-700 transition-colors leading-tight truncate tracking-tight">
              {title}
            </h3>

            {verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                Verified
              </span>
            )}
          </div>

          {/* Line 2: Category • City */}
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              {category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {city}
            </span>
          </div>

          {/* Line 3: Phone number + Open Now pill */}
          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            {phone && (
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {phone}
              </p>
            )}
            <TagChip label="Open Now" />
          </div>
        </div>
      </div>

      {/* Chevron Action Indicator */}
      <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
        <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  );
};

export default BusinessCard;
