import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Heart, Shield, Settings, FileText, Database, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickAccessGrid = () => {
  const links = [
    { name: 'Communities', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', path: '/admin/communities' },
    { name: 'Member Audit', icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10', path: '/admin/members' },
    { name: 'Subscriptions', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/admin/subscriptions' },
    { name: 'Matrimonial', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', path: '/admin/matrimonial' },
    { name: 'Complaints', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10', path: '/admin/complaints' },
    { name: 'CMS & Banners', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10', path: '/admin/cms' },
    { name: 'City Config', icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10', path: '/admin/cities' },
    { name: 'Settings', icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10', path: '/admin/config' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="card-neo p-5 flex flex-col h-full"
    >
      <div className="mb-5">
        <h2 className="text-sm font-black text-white">Platform Modules</h2>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {links.map((link, idx) => {
          const Icon = link.icon;
          return (
            <Link 
              key={idx} 
              to={link.path}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.bg} ${link.color} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider group-hover:text-white transition-colors">
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};
