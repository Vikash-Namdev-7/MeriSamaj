import { CheckCircle, Phone, MapPin, Building2 } from 'lucide-react';
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
    color = 'bg-indigo-500 text-white',
  } = business;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative w-full rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5"
    >
      {/* LEFT & MIDDLE SECTION (Image + Details in 1 line/row) */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Business Image / Logo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-xs border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center">
          {logo ? (
            <img
              src={logo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center font-bold text-lg sm:text-xl ${color} group-hover:scale-105 transition-transform duration-300`}
            >
              {initials || title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Middle Details */}
        <div className="space-y-1 min-w-0 flex-1">
          {/* Line 1: Title & Verified Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors leading-tight truncate">
              {title}
            </h3>

            {verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2.5 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                Verified
              </span>
            )}
          </div>

          {/* Line 2: Category • City */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {city}
            </span>
          </div>

          {/* Line 3: Phone number + Open Now pill next to it */}
          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            {phone && (
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {phone}
              </p>
            )}
            <TagChip label="Open Now" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessCard;
