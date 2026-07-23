import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const DirectoryHeader = ({ onBack, onAddBusiness }) => {
  return (
    <div className="w-full flex items-center justify-between py-3">
      {/* Left & Title section */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          aria-label="Go Back"
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-800 hover:text-indigo-600 hover:border-indigo-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </motion.button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Professional Directory
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Discover trusted professionals near you
          </p>
        </div>
      </div>

      {/* Right Action Button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAddBusiness}
        className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 font-semibold text-xs sm:text-sm shadow-sm hover:shadow flex items-center gap-1.5 shrink-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Business</span>
      </motion.button>
    </div>
  );
};

export default DirectoryHeader;
