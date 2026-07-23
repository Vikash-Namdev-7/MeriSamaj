import {
  Hammer,
  HeartPulse,
  GraduationCap,
  BriefcaseBusiness,
  LayoutGrid,
  Building,
  Sparkles
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

// Category style & icon lookup
const getCategoryDetails = (cat) => {
  const key = (cat.categoryKey || cat.id || cat.name || '').toLowerCase();
  const iconName = (cat.iconName || '').toLowerCase();

  if (key.includes('construction') || iconName.includes('hammer')) {
    return {
      Icon: Hammer,
      gradient: 'from-emerald-500 to-teal-600',
    };
  }
  if (key.includes('health') || iconName.includes('heart')) {
    return {
      Icon: HeartPulse,
      gradient: 'from-rose-500 to-pink-600',
    };
  }
  if (key.includes('education') || iconName.includes('graduation')) {
    return {
      Icon: GraduationCap,
      gradient: 'from-blue-500 to-indigo-600',
    };
  }
  if (key.includes('business') || iconName.includes('briefcase')) {
    return {
      Icon: BriefcaseBusiness,
      gradient: 'from-amber-500 to-orange-600',
    };
  }
  if (key.includes('manufactur') || key.includes('building')) {
    return {
      Icon: Building,
      gradient: 'from-indigo-500 to-purple-600',
    };
  }
  if (key.includes('other') || iconName.includes('layout') || iconName.includes('grid')) {
    return {
      Icon: LayoutGrid,
      gradient: 'from-purple-500 to-indigo-600',
    };
  }

  const DynamicIcon = Icons[cat.iconName] || Sparkles;
  return {
    Icon: DynamicIcon,
    gradient: 'from-indigo-500 to-purple-600',
  };
};

const CategoryCard = ({ category, isSelected, onClick }) => {
  const { Icon, gradient } = getCategoryDetails(category);

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative w-[155px] h-[98px] rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 shrink-0 cursor-pointer ${
        isSelected
          ? 'bg-white border-2 border-indigo-600 shadow-md shadow-indigo-600/10'
          : 'bg-white/80 border border-slate-200/80 hover:bg-white hover:shadow-sm'
      }`}
    >
      {/* Selected Indicator Pill */}
      {isSelected && (
        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-indigo-600" />
      )}

      {/* Circular Icon Container */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 bg-gradient-to-br ${gradient} text-white shadow-xs transition-transform duration-200 ${
          isSelected ? 'scale-105 ring-2 ring-indigo-600/20' : ''
        }`}
      >
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>

      {/* Category Name */}
      <span
        className={`text-xs font-bold truncate max-w-full tracking-tight ${
          isSelected ? 'text-indigo-600' : 'text-slate-800'
        }`}
      >
        {category.name}
      </span>
    </motion.button>
  );
};

export default CategoryCard;
