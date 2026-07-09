import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, Briefcase, FileText, Activity, Shield, Heart, MapPin, Building2, Calendar, Phone, Mail } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';

export const UserProfileDrawer = ({ user, isOpen, onClose, onVerify }) => {
  const [activeTab, setActiveTab] = useState('personal');

  if (!user) return null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'community', label: 'Community Details', icon: Users },
    { id: 'family', label: 'Family', icon: Heart },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'matrimonial', label: 'Matrimonial', icon: MapPin },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-4xl bg-surface z-[110] shadow-2xl flex flex-col border-l border-white/20"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-gray-100 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-5">
                <Avatar 
                  initials={user.name.charAt(0)} 
                  imageUrl={user.avatar} 
                  size="xl" 
                  color="bg-brand-primary text-white"
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-gray-800">{user.name}</h2>
                    {user.isVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                        Verified
                      </span>
                    ) : (
                      <button 
                        onClick={() => onVerify(user.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors uppercase tracking-widest shadow-md shadow-amber-500/20"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                  <p className="text-gray-500 font-medium">{user.role} • {user.memberId}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Phone size={14} className="text-gray-400" /> {user.phone}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Mail size={14} className="text-gray-400" /> {user.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Building2 size={14} className="text-gray-400" /> {user.communityName}, {user.city}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-64 bg-gray-50 border-r border-gray-100 overflow-y-auto hidden md:block py-4">
                <div className="px-4 mb-2 text-xs font-bold !text-black uppercase tracking-wider">
                  Profile Sections
                </div>
                <nav className="space-y-1 px-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id 
                          ? 'bg-white text-brand-primary shadow-sm border border-gray-200' 
                          : '!text-black hover:bg-gray-200/50 hover:text-gray-800'
                      }`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? 'text-brand-primary' : 'text-gray-400'} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-surface">
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
                          <p className="font-semibold text-gray-800">{user.gender}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Age</label>
                          <p className="font-semibold text-gray-800">{user.age} Years</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Blood Group</label>
                          <p className="font-semibold text-gray-800">{user.bloodGroup}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registration Date</label>
                          <p className="font-semibold text-gray-800">{new Date(user.registrationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Login</label>
                          <p className="font-semibold text-gray-800">{new Date(user.lastLogin).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab !== 'personal' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in opacity-50">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      {React.createElement(tabs.find(t => t.id === activeTab)?.icon || FileText, { size: 32, className: "text-gray-400" })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
                    <p className="text-gray-500 max-w-sm">This section is currently under development for the enterprise refactoring task.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
               <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  View Full Audit Log
               </button>
               <div className="flex items-center gap-3">
                  <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all text-sm">
                    Transfer Community
                  </button>
                  <button className="px-6 py-2 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 transition-all text-sm">
                    Save Changes
                  </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
