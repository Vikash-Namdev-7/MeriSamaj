import React, { useState, useMemo } from 'react';
import { Search, MapPin, UserCheck, UserPlus, Compass } from 'lucide-react';
import { useData } from '../../../context/DataProvider';

export const DiscoverContent = () => {
  const { members = [], followRelations = [], sendFollowRequest, unfollowUser, currentUser } = useData();
  const [searchText, setSearchText] = useState('');
  
  const followedIds = useMemo(() => {
    return followRelations
      .filter(rel => rel.followerId === currentUser?.id)
      .map(rel => rel.followingId);
  }, [followRelations, currentUser]);

  const filteredMembers = useMemo(() => {
    if (!searchText.trim()) return members;
    const query = searchText.toLowerCase();
    return members.filter(m => 
      m.id !== currentUser?.id && (
        m.name?.toLowerCase().includes(query) ||
        m.phone?.toLowerCase().includes(query) ||
        m.id?.toLowerCase().includes(query)
      )
    );
  }, [members, searchText, currentUser]);

  const handleFollowToggle = (userId, isFollowing) => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      sendFollowRequest(userId);
    }
  };

  return (
    <div className="p-5 pb-28">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-purple-500/15 border border-purple-400/20 relative overflow-hidden">
        <div className="relative z-10">
          <Compass size={32} className="mb-3 text-white/90" />
          <h3 className="text-[20px] font-bold tracking-tight">Discover Members</h3>
          <p className="text-[13px] text-white/80 mt-1 font-medium">Find and connect with people in your community.</p>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
      </div>
      
      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={18} className="text-purple-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, mobile, or ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-purple-100 rounded-2xl text-[14px] font-medium placeholder-purple-300 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-[15px] text-text-primary">
          {searchText ? 'Search Results' : 'Suggested Connections'}
        </h4>
        <span className="text-[11px] font-bold text-brand-primary bg-purple-50 px-2 py-1 rounded-lg">
          {filteredMembers.length} {filteredMembers.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3">
            <Search size={24} className="text-purple-300" />
          </div>
          <p className="text-[14px] font-bold text-slate-700">No members found</p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-[200px]">Try searching with a different name, mobile number or ID.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredMembers.map(user => {
            const isFollowing = followedIds.includes(user.id);
            return (
              <div key={user.id} className="card-neo p-4 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 text-[20px] font-bold mb-2.5 shadow-sm border border-purple-200/20 shrink-0">
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" /> : user.initials}
                </div>
                <h5 className="text-[14px] font-bold text-text-primary line-clamp-1 leading-none">{user.name}</h5>
                <p className="text-[11px] text-text-secondary mt-1 font-semibold flex items-center gap-1">
                  <MapPin size={10} /> {user.city}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-3.5 line-clamp-1 h-3.5">{user.profession}</p>
                
                <button 
                  onClick={() => handleFollowToggle(user.id, isFollowing)}
                  className={`w-full py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-xl transition-all press-scale ${
                    isFollowing 
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                      : 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-dark'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={14} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Follow
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
