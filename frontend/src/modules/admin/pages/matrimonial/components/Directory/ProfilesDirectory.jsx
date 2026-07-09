import React, { useState } from 'react';
import { Search, Filter, MoreVertical, ShieldCheck, ShieldAlert, Eye, UserX, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '../../../../../member/components/common/Avatar';

export const ProfilesDirectory = ({ data }) => {
  const { profiles } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState([]);

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.profileId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.community.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProfiles(filteredProfiles.map(p => p.id));
    } else {
      setSelectedProfiles([]);
    }
  };

  const handleSelect = (id) => {
    if (selectedProfiles.includes(id)) {
      setSelectedProfiles(selectedProfiles.filter(pId => pId !== id));
    } else {
      setSelectedProfiles([...selectedProfiles, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by Name, Profile ID, or Community..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2">
          {selectedProfiles.length > 0 && (
            <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm bg-brand-primary">
              Bulk Actions ({selectedProfiles.length})
            </button>
          )}
          <button className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
            <Filter size={16} /> Advanced Filters
          </button>
          <button className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedProfiles.length === filteredProfiles.length && filteredProfiles.length > 0}
                    className="rounded border-gray-600 bg-transparent"
                  />
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Profile Info</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Community</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Demographics</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile, idx) => (
                <motion.tr 
                  key={profile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${selectedProfiles.includes(profile.id) ? 'bg-white/5' : ''}`}
                >
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={() => handleSelect(profile.id)}
                      className="rounded border-gray-600 bg-transparent"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar imageUrl={profile.photoUrl} initials={profile.name.charAt(0)} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-white">{profile.name}</p>
                          {profile.verificationStatus === 'verified' && <ShieldCheck size={14} className="text-emerald-400" />}
                        </div>
                        <p className="text-xs text-brand-primary/80 font-mono mt-0.5">{profile.profileId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-300">{profile.community}</p>
                    <p className="text-xs text-gray-500">{profile.city}, {profile.state}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-300">{profile.age} yrs, {profile.gender}</p>
                    <p className="text-xs text-gray-500">{profile.profession}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md flex items-center w-max gap-1 ${
                      profile.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      profile.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {profile.status === 'reported' && <ShieldAlert size={12} />}
                      {profile.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors" title="View Profile Drawer">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Suspend/Hide">
                        <UserX size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProfiles.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No profiles match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilesDirectory;
