import React from 'react';
import { Heart, Users, ArrowRight } from 'lucide-react';

export const DonationCard = ({
  donation,
  onDonateClick,
  onCardClick
}) => {
  if (!donation) return null;

  const raised = donation.raisedAmount || 0;
  const target = donation.targetAmount || 1;
  const percentage = Math.min(100, Math.round((raised / target) * 100));

  return (
    <div
      onClick={() => onCardClick && onCardClick(donation._id)}
      className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-1"
    >
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {donation.coverImage ? (
          <img
            src={donation.coverImage}
            alt={donation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-indigo-50 to-purple-50">
            <Heart className="w-12 h-12 text-indigo-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 text-indigo-700 shadow-sm backdrop-blur-md">
            {donation.category || 'General'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {donation.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {donation.description || 'Join hands to support this noble community cause.'}
          </p>
        </div>

        {/* Progress Bar & Amount Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-indigo-600 font-extrabold text-sm">₹{raised.toLocaleString()}</span>
            <span className="text-slate-400 font-medium">Goal: ₹{target.toLocaleString()}</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 text-slate-600">
              <Users size={12} className="text-indigo-500" /> {donation.donorCount || 0} Donors
            </span>
            <span className="text-indigo-600 font-bold">{percentage}% Funded</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDonateClick(donation);
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Heart size={14} className="fill-white" /> Donate Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DonationCard;
