import { Search, RotateCcw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ onReset, onAddBusiness }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full rounded-2xl bg-white border border-slate-200/80 p-8 text-center shadow-xs flex flex-col items-center justify-center my-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100/80">
        <Search className="w-8 h-8 stroke-[2]" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        No Businesses Found
      </h3>

      <p className="text-xs font-medium text-slate-500 max-w-sm mt-1.5 leading-relaxed">
        We couldn't find any results matching your search query or active filters. Try adjusting your filters or search term.
      </p>

      <div className="flex items-center gap-2.5 mt-5">
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}

        {onAddBusiness && (
          <button
            onClick={onAddBusiness}
            className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Business
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
