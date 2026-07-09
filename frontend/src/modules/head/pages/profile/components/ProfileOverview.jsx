import React from 'react';
import { Camera, ShieldCheck, Mail, Phone, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';

export const ProfileOverview = ({ profile, stats, completionPercentage, missingFields, onAvatarUpload }) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="card-neo p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-br from-brand-primary to-purple-600 shadow-xl shadow-brand-primary/20">
              <Avatar 
                initials={`${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}
                imageUrl={profile.avatar}
                size="xl"
                color="bg-white text-brand-primary font-black w-full h-full rounded-xl"
              />
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-brand-primary hover:scale-110 transition-all cursor-pointer">
              <Camera size={14} />
              <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => onAvatarUpload(e.target.files[0])} />
            </label>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-gray-900">{profile.firstName} {profile.lastName}</h2>
              {profile.accountStatus === 'Active' && (
                <ShieldCheck className="text-emerald-500" size={20} />
              )}
            </div>
            <p className="text-brand-primary font-bold text-sm tracking-wide mb-3">{profile.designation} • {profile.communityName}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><Mail size={14} /> {profile.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={14} /> {profile.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {profile.city}, {profile.state}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {profile.memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Widget */}
      <div className="card-neo p-6 bg-gradient-to-br from-brand-primary/5 to-transparent border border-brand-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            Profile Completion
            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-100 text-xs font-black text-brand-primary shadow-sm">
              {completionPercentage}%
            </span>
          </h3>
        </div>
        
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {missingFields.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-rose-100/50 shadow-sm">
            <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" />
              Missing Information Checklist
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingFields.map(field => (
                <span key={field} className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
