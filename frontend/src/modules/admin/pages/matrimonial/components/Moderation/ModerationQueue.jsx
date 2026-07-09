import React from 'react';
import { Check, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ModerationQueue = ({ data }) => {
  const { profiles } = data;
  const pendingProfiles = profiles.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Moderation Queue</h2>
          <p className="text-xs text-gray-400">Review pending matrimonial profiles and KYC verifications</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle size={14} />
          {pendingProfiles.length} Pending Actions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingProfiles.map((profile, idx) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-neo p-5 relative"
          >
            <div className="flex items-start gap-4 mb-4">
              <img src={profile.photoUrl} alt={profile.name} className="w-16 h-16 rounded-xl object-cover border-2 border-white/10" />
              <div>
                <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                <p className="text-xs text-brand-primary font-mono">{profile.profileId}</p>
                <p className="text-[10px] text-gray-400 mt-1">{profile.community}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Age / Gender</span>
                <span className="text-gray-300 font-medium">{profile.age}, {profile.gender}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profession</span>
                <span className="text-gray-300 font-medium">{profile.profession}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Marital Status</span>
                <span className="text-gray-300 font-medium">{profile.maritalStatus}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profile Completion</span>
                <span className="text-emerald-400 font-bold">{profile.completionPct}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1">
                <Check size={14} /> Approve
              </button>
              <button className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1">
                <X size={14} /> Reject
              </button>
            </div>
          </motion.div>
        ))}

        {pendingProfiles.length === 0 && (
          <div className="col-span-full card-neo p-12 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-300 mb-2">Queue is Empty</h3>
            <p className="text-sm text-gray-500 max-w-sm">All pending matrimonial profiles have been reviewed. Excellent work!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationQueue;
