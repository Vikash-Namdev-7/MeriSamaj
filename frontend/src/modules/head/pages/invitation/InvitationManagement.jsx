import React, { useState, useEffect } from 'react';
import { useData } from '../../../member/context/DataProvider';
import { Mail, Search, Filter, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, Eye, AlertCircle, ChevronDown, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InvitationFormModal from './components/InvitationFormModal';
import InvitationDetailModal from './components/InvitationDetailModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

export default function InvitationManagement() {
  const navigate = useNavigate();
  const { invitations, updateInvitationStatus, updateInvitation, deleteInvitation, createInvitation, currentUser, invitationFormConfig, updateInvitationConfig } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'My Invitations', 'Today', 'This Week', 'This Month', 'Upcoming', 'Past'];
  
  const [localConfig, setLocalConfig] = useState(invitationFormConfig || {});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (invitationFormConfig) {
      setLocalConfig(invitationFormConfig);
    }
  }, [invitationFormConfig]);

  const handleToggle = (key) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveConfig = () => {
    if (updateInvitationConfig) {
      updateInvitationConfig(localConfig);
      setToastMessage('Configuration saved successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const renderToast = () => toastMessage && (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce font-sans text-xs font-bold select-none max-w-[90%] w-max text-center">
      <CheckCircle size={15} className="text-emerald-200 shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );

  // Dynamic Form Fields State
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleDeleteField = (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setLocalConfig(prev => ({
        ...prev,
        formFields: prev.formFields.filter(f => f.id !== id)
      }));
    }
  };

  const startEditField = (field) => {
    setEditingFieldId(field.id);
    setEditFormData({ ...field });
  };

  const saveEditedField = () => {
    setLocalConfig(prev => ({
      ...prev,
      formFields: prev.formFields.map(f => f.id === editingFieldId ? editFormData : f)
    }));
    setEditingFieldId(null);
  };

  const addNewField = () => {
    const newId = `custom_${Date.now()}`;
    const newField = { 
      id: newId, 
      label: 'New Field', 
      desc: 'Description for new field', 
      type: 'text', 
      required: false 
    };
    setLocalConfig(prev => ({
      ...prev,
      formFields: [...(prev.formFields || []), newField]
    }));
    startEditField(newField);
  };

  const directorySettings = [
    { key: 'enableMembersTab', label: 'Show Members Directory', desc: 'Allow inviting general members' },
    { key: 'enablePresidentsTab', label: 'Show Presidents Tab', desc: 'Allow inviting community presidents' },
    { key: 'enableGroupsTab', label: 'Show Groups Tab', desc: 'Allow inviting entire groups' },
    { key: 'enableFriendsTab', label: 'Show Friends Tab', desc: 'Allow inviting from friends list' },
    { key: 'enableBatchInvite', label: 'Batch Invite Actions', desc: 'Allow "Invite All" bulk actions' }
  ];
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedViewInvitation, setSelectedViewInvitation] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState(null);

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch = 
      inv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.hostName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.groomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.brideName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    if (activeFilter === 'All') {
      return true;
    }

    const invDate = parseLocalDate(inv.date);
    invDate.setHours(0, 0, 0, 0);

    if (activeFilter === 'Upcoming') {
      return invDate >= today;
    }
    if (activeFilter === 'Past') {
      return invDate < today;
    }
    if (activeFilter === 'Today') {
      return invDate.getTime() === today.getTime();
    }
    if (activeFilter === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return invDate >= startOfWeek && invDate <= endOfWeek;
    }
    if (activeFilter === 'This Month') {
      return invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
    }
    if (activeFilter === 'My Invitations') {
      const creatorIdStr = typeof inv.creatorId === 'object' && inv.creatorId !== null
        ? inv.creatorId._id || inv.creatorId.id
        : inv.creatorId;
      return String(creatorIdStr) === String(currentUser?.id || currentUser?._id);
    }

    return true;
  });

  const handleEditClick = (inv) => {
    setSelectedInvitation(inv);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedInvitation(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (inv) => {
    setInvitationToDelete(inv);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (invitationToDelete) {
      try {
        await deleteInvitation(invitationToDelete._id || invitationToDelete.id);
        setIsDeleteConfirmOpen(false);
        setInvitationToDelete(null);
      } catch (err) {
        console.error('Failed to delete invitation', err);
        const errMsg = err.response?.data?.message || err.message;
        alert(`Delete failed: ${errMsg}\n\nPlease verify that your backend server has been restarted to apply the latest role permissions.`);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateInvitationStatus(id, newStatus);
  };

  const handleSaveModal = async (formDataPayload) => {
    try {
      if (selectedInvitation) {
        await updateInvitation(selectedInvitation._id || selectedInvitation.id, formDataPayload);
      } else {
        await createInvitation(formDataPayload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save invitation', err);
    }
  };

  const handleViewClick = (inv) => {
    setSelectedViewInvitation(inv);
    setIsViewModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {renderToast()}
      
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
            onClick={handleCreateClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> Create Invitation
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Toolbar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3 mb-4">
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

        {/* Filter Pills */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-1 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-[12px] font-bold transition-all press-scale ${
                activeFilter === filter 
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-300/40' 
                  : 'bg-purple-50 text-[#7C3AED] border border-purple-100/30 hover:bg-purple-100/40'
              }`}
            >
              {filter}
            </button>
          ))}
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
                              onClick={() => handleDeleteClick(inv)}
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
        
        {/* Dynamic Form Configuration Section */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Settings size={16} />
              </div>
              <div>
                <h2 className="text-[14px] font-black text-slate-800">Dynamic Form Configuration</h2>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Manage form fields and directory features</p>
              </div>
            </div>
            <button 
              onClick={handleSaveConfig}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-[12px] transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Check size={14} strokeWidth={3} /> Save Configuration
            </button>
          </div>

          <div className="p-5 border-b border-slate-100 bg-white">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-slate-800">Form Fields</h3>
              <button onClick={addNewField} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Add Field
              </button>
            </div>
            <div className="space-y-3">
              {localConfig?.formFields?.map(field => (
                <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all">
                  {editingFieldId === field.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Field Label</label>
                          <input 
                            type="text" 
                            value={editFormData.label} 
                            onChange={e => setEditFormData({...editFormData, label: e.target.value})}
                            className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Input Type</label>
                          <select 
                            value={editFormData.type} 
                            onChange={e => setEditFormData({...editFormData, type: e.target.value})}
                            className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1 bg-white"
                          >
                            <option value="text">Text</option>
                            <option value="time">Time</option>
                            <option value="date">Date</option>
                            <option value="url">URL Link</option>
                            <option value="tel">Phone</option>
                            <option value="file">File Upload</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                        <input 
                          type="text" 
                          value={editFormData.desc} 
                          onChange={e => setEditFormData({...editFormData, desc: e.target.value})}
                          className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editFormData.required} 
                            onChange={e => setEditFormData({...editFormData, required: e.target.checked})}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          Required Field
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingFieldId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                          <button onClick={saveEditedField} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase font-black">Required</span>}
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">{field.type}</span>
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{field.desc}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setLocalConfig(prev => ({
                              ...prev,
                              formFields: prev.formFields.map(f => f.id === field.id ? { ...f, enabled: f.enabled === false ? true : false } : f)
                            }));
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${field.enabled !== false ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          title={field.enabled !== false ? "Disable Field" : "Enable Field"}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.enabled !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                          <button onClick={() => startEditField(field)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteField(field.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {localConfig?.formFields?.length === 0 && (
                <div className="text-center p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm font-semibold text-slate-500">
                  No form fields added.
                </div>
              )}
            </div>
          </div>

          {/* Directory Settings */}
          <div className="overflow-x-auto">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-[13px] font-bold text-slate-800">Directory & Sharing Settings</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Setting Option</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Description</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {directorySettings.map(option => (
                  <tr key={option.key} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[13px] text-slate-800">{option.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] font-medium text-slate-500">{option.desc}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => handleToggle(option.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${localConfig?.[option.key] ? 'bg-indigo-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localConfig?.[option.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      <InvitationDetailModal 
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedViewInvitation(null); }}
        invitation={selectedViewInvitation}
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setInvitationToDelete(null); }}
        onConfirm={handleConfirmDelete}
        invitationTitle={invitationToDelete?.title || (invitationToDelete?.groomName ? `${invitationToDelete.groomName} & ${invitationToDelete.brideName}` : '')}
      />

    </div>
  );
}
