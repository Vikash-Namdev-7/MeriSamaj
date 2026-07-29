import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const DirectoryHeader = ({ onBack, onAddBusiness }) => {
  return (
    <div className="w-full flex items-center justify-between py-2.5">
      {/* Left & Title section */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          aria-label="Go Back"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors shrink-0 press-scale"
        >
          <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
        </motion.button>

        <div className="text-left">
          <h1 className="text-[18px] sm:text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Professional Directory
          </h1>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Discover trusted professionals near you
          </p>
        </div>
      </div>

      {/* Right Action Button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onAddBusiness}
        className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 font-bold text-[11.5px] sm:text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 shrink-0 transition-all press-scale"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Business</span>
      </motion.button>
    </div>
  );
};

export default DirectoryHeader;
