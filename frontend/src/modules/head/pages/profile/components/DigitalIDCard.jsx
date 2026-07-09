import React from 'react';
import { Download, Share2, Printer, CheckCircle, Shield } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';

export const DigitalIDCard = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="card-neo p-6 md:p-10 flex flex-col items-center">
        
        {/* The Card */}
        <div className="w-[320px] md:w-[380px] rounded-3xl overflow-hidden shadow-2xl relative bg-white border border-gray-200">
          {/* Header */}
          <div className="h-28 bg-gradient-to-br from-brand-primary to-purple-800 relative p-4 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black">
                म
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">Community Head ID</p>
                <p className="text-sm font-black text-white">{profile.communityId}</p>
              </div>
            </div>
          </div>

          {/* Avatar overlap */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 p-1.5 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 rounded-xl overflow-hidden">
              <Avatar 
                initials={`${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}
                imageUrl={profile.avatar}
                size="full"
                color="bg-gradient-to-br from-brand-primary to-purple-500 text-white font-black"
              />
            </div>
          </div>

          {/* Body */}
          <div className="pt-12 pb-6 px-6 text-center">
            <h2 className="text-xl font-black text-gray-900 flex items-center justify-center gap-2 mb-1">
              {profile.firstName} {profile.lastName}
              {profile.accountStatus === 'Active' && <CheckCircle size={16} className="text-emerald-500" />}
            </h2>
            <p className="text-sm font-bold text-brand-primary mb-1">{profile.designation}</p>
            <p className="text-xs font-medium text-gray-500 mb-6">{profile.communityName}</p>

            <div className="flex justify-center mb-6">
              {/* QR Code Placeholder */}
              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <Shield size={32} className="mb-2 opacity-50" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Scan to Verify</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <div>
                <p>Issued</p>
                <p className="text-gray-900">{profile.memberSince}</p>
              </div>
              <div className="text-right">
                <p>Valid Till</p>
                <p className="text-gray-900">Dec 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md">
            <Download size={16} /> Download PDF
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print Card
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};
