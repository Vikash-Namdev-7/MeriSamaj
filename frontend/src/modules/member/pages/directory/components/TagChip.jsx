import { Clock, Sparkles, Navigation } from 'lucide-react';

const tagStyles = {
  'Open Now': {
    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
    Icon: Clock,
  },
  'Top Rated': {
    bg: 'bg-amber-50 text-amber-700 border-amber-100',
    Icon: Sparkles,
  },
  'Nearby': {
    bg: 'bg-purple-50 text-purple-700 border-purple-100',
    Icon: Navigation,
  },
};

const TagChip = ({ label }) => {
  const style = tagStyles[label] || {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    Icon: Sparkles,
  };
  const { bg, Icon } = style;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${bg}`}
    >
      <Icon className="w-3 h-3 stroke-[2.2]" />
      <span>{label}</span>
    </span>
  );
};

export default TagChip;
