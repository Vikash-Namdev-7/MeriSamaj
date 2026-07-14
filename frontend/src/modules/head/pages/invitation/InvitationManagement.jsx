import React, { useState } from 'react';
import { useData } from '../../../member/context/DataProvider';
import { Mail, Search, Filter, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, Eye, AlertCircle, ChevronDown, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InvitationFormModal from './components/InvitationFormModal';
import InvitationFormSettingsModal from './components/InvitationFormSettingsModal';

export default function InvitationManagement() {
  const navigate = useNavigate();
  const { invitations, updateInvitationStatus, updateInvitation, deleteInvitation, createInvitation, currentUser } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch = 
      inv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.hostName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.groomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.brideName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  const handleEditClick = (inv) => {
    setSelectedInvitation(inv);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedInvitation(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this invitation?")) {
      deleteInvitation(id);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateInvitationStatus(id, newStatus);
  };

  const handleSaveModal = (formData) => {
    if (selectedInvitation) {
      // update
      updateInvitation(selectedInvitation.id || selectedInvitation._id, formData);
    } else {
      // create
      const newInv = {
        ...formData,
        id: `inv_${Date.now()}`,
        creatorId: currentUser?.id,
        createdAt: new Date().toISOString(),
        images: []
      };
      // In a real app, you'd use createInvitation(newInv) which returns a promise.
      // Since it's mock in DataProvider, we might just need to manually add it to context or call createInvitation
      createInvitation(newInv);
    }
    setIsModalOpen(false);
  };

  const handleViewClick = (inv) => {
    // Navigate within the same app to preserve mock state
    navigate(`/member/invitations/${inv.id || inv._id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> Invitations Desk
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Manage all community events, weddings, and RSVPs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2"
          >
            <Settings size={16} /> Form Config
          </button>
          <button 
            onClick={handleCreateClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> Create Invitation
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Toolbar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by title, host, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Event Details</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Host / Family</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Location</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">RSVPs</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredInvitations.map(inv => {
                    const displayTitle = inv.title || `Wedding: ${inv.groomName} & ${inv.brideName}`;
                    const displayHost = inv.hostName || inv.familyName;
                    const rsvpCount = inv.rsvps?.length || 0;
                    const id = inv.id || inv._id;

                    return (
                      <motion.tr 
                        key={id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/50 flex flex-col items-center justify-center shrink-0">
                              <span className="text-indigo-600 text-[9px] font-bold uppercase leading-none mb-0.5">{new Date(inv.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-indigo-700 text-[14px] font-black leading-none">{new Date(inv.date).getDate()}</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[14px]">{displayTitle}</p>
                              <p className="text-[11px] font-semibold text-slate-500">{inv.type || (inv.title ? 'Standard Event' : 'Wedding')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-[13px] text-slate-700">{displayHost}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[13px] text-slate-800">{new Date(inv.date).toLocaleDateString()}</p>
                          <p className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">{inv.location}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-slate-100 text-slate-700 font-bold text-[12px]">
                            {rsvpCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleViewClick(inv)}
                              className="p-2 !text-slate-400 hover:!text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(id)}
                              className="p-2 !text-slate-400 hover:!text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            
            {filteredInvitations.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-[15px]">No invitations found</h3>
                <p className="text-slate-500 text-[13px] font-medium mt-1">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Modals */}
      <InvitationFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        invitationData={selectedInvitation}
        onSave={handleSaveModal}
      />

      <InvitationFormSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </div>
  );
}
