import React from 'react';
import { Heart, Users, ArrowRight, Sparkles } from 'lucide-react';

export const DonationCard = ({
  donation,
  onDonateClick,
  onCardClick
}) => {
  if (!donation) return null;

  const raised = donation.raisedAmount ?? donation.raised ?? donation.collectedAmount ?? 0;
  const target = donation.targetAmount ?? donation.target ?? 1;
  const percentage = donation.percentage ?? (target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0);

  return (
    <div
      onClick={() => onCardClick && onCardClick(donation._id)}
      className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.09)] hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1 text-left"
    >
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {donation.coverImage ? (
          <img
            src={donation.coverImage}
            alt={donation.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-emerald-300 bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] p-6 text-center">
            <Heart className="w-12 h-12 text-emerald-200 opacity-80" />
          </div>
        )}
        <div className="absolute top-3.5 left-3.5">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/90 text-emerald-800 shadow-sm backdrop-blur-md border border-white/40 uppercase tracking-wider">
            {donation.category || 'General'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors tracking-tight">
            {donation.title}
          </h3>
          <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 font-medium leading-relaxed">
            {donation.description || 'Join hands to support this noble community cause.'}
          </p>
        </div>

        {/* Progress Bar & Amount Metrics */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-baseline text-xs font-extrabold">
            <span className="text-emerald-600 font-black text-[15px]">₹{raised.toLocaleString('en-IN')}</span>
            <span className="text-slate-400 font-bold text-[11.5px]">Goal: ₹{target.toLocaleString('en-IN')}</span>
          </div>

          <div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-extrabold text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 text-slate-600">
              <Users size={13} className="text-emerald-600" /> {donation.donorCount || 0} Donors
            </span>
            <span className="text-emerald-700 font-black">{percentage}% Funded</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDonateClick(donation);
          }}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white text-[12px] font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer press-scale"
        >
          <Heart size={14} className="fill-white text-white" /> Donate Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DonationCard;
