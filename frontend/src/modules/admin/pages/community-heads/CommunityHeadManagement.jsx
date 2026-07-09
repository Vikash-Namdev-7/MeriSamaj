import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCommunityHeads } from '../../hooks/useCommunityHeads';
import { DashboardCards } from './components/DashboardCards';
import { CommunityHeadTable } from './components/CommunityHeadTable';
import { HeadActivityTimeline } from './components/HeadActivityTimeline';
import { Users, Plus, Download, Upload } from 'lucide-react';
import { CommunityHeadForm } from './components/CommunityHeadForm';

export const CommunityHeadManagement = () => {
  const { heads, stats, auditLogs, loading, error, handleStatusChange, createHead } = useCommunityHeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Loading Head Roster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-lg mx-auto mt-20">
        <h3 className="text-rose-400 font-bold mb-2">System Error</h3>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 pt-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black !text-black flex items-center gap-2">
            <Users size={28} className="text-brand-primary" />
            Community Head Management
          </h1>
          <p className="text-sm !text-gray-800 mt-1">
            Complete lifecycle administration of all Community Heads.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white !text-black hover:bg-gray-50 transition-all text-sm font-bold border border-gray-200">
            <Upload size={16} /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white !text-black hover:bg-gray-50 transition-all text-sm font-bold border border-gray-200">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-all text-sm font-bold shadow-lg shadow-brand-primary/25"
          >
            <Plus size={16} /> Create Head
          </button>
        </div>
      </div>

      {/* ─── DASHBOARD CARDS ─── */}
      <DashboardCards stats={stats} />

      {/* ─── MAIN CONTENT GRID ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Table (Takes 2 columns on XL) */}
        <div className="xl:col-span-2 space-y-6">
          <CommunityHeadTable 
            heads={heads} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="xl:col-span-1 space-y-6">
          <HeadActivityTimeline logs={auditLogs} />
        </div>

      </div>

      <CommunityHeadForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={async (data) => {
          await createHead({ name: 'New Assigned Head', email: 'new@example.com', phone: '0000000000', city: 'Mumbai', ...data });
          setIsCreateModalOpen(false);
        }} 
      />
    </div>
  );
};

export default CommunityHeadManagement;
