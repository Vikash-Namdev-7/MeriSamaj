import React from 'react';
import { X, Heart, Users, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const ViewDonationModal = ({
  isOpen,
  onClose,
  donation = null
}) => {
  if (!isOpen || !donation) return null;

  const raised = donation.raisedAmount || 0;
  const target = donation.targetAmount || 1;
  const percentage = Math.min(100, Math.round((raised / target) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-100 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-48 bg-slate-100">
          {donation.coverImage ? (
            <img src={donation.coverImage} alt={donation.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <Heart className="w-12 h-12" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-sm hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
              {donation.category || 'General'}
            </span>
            {donation.status === 'Active' ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                Active Drive
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-white shadow-sm">
                Closed Drive
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{donation.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{donation.description || 'No detailed description provided.'}</p>
          </div>

          {/* Metrics Card */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Raised So Far</span>
                <span className="text-2xl font-black text-indigo-600">₹{raised.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Goal</span>
                <span className="text-base font-bold text-slate-700">₹{target.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
            </div>

            <div className="flex justify-between text-xs font-bold text-slate-500 pt-1">
              <span className="flex items-center gap-1"><Users size={14} className="text-indigo-600" /> {donation.donorCount || 0} Total Donors</span>
              <span>{percentage}% Funded</span>
            </div>
          </div>

          {/* Recent Donors List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Donors History</h4>
            {(!donation.recentDonations || donation.recentDonations.length === 0) ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                No donor records logged yet for this campaign.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {donation.recentDonations.map((donor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {donor.donorName ? donor.donorName[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{donor.donorName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(donor.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">+₹{(donor.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDonationModal;
