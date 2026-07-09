import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Building2, MapPin } from 'lucide-react';

// Reusable Modal Wrapper
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#1e1e2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 shrink-0">
            <h3 className="text-lg font-black text-white">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          {/* Body */}
          <div className="p-6 overflow-y-auto overflow-x-hidden no-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const AddEditCityModal = ({ isOpen, onClose, city, onSave }) => {
  const isEditing = !!city;
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    state: '',
    country: 'India',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || '',
        code: city.code || '',
        state: city.state || '',
        country: city.country || 'India',
        description: city.description || '',
        status: city.status || 'Active'
      });
    } else {
      setFormData({
        name: '', code: '', state: '', country: 'India', description: '', status: 'Active'
      });
    }
  }, [city, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit City' : 'Register New City'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">City Name <span className="text-rose-400">*</span></label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                type="text" 
                placeholder="e.g. Mumbai"
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">City Code <span className="text-rose-400">*</span></label>
            <input 
              required 
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              type="text" 
              maxLength={4}
              placeholder="e.g. MUM"
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">State <span className="text-rose-400">*</span></label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required 
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                type="text" 
                placeholder="e.g. Maharashtra"
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Country</label>
            <input 
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              type="text" 
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
          <select
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-primary appearance-none"
          >
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
          <textarea 
            rows="3"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Brief details about this city branch..."
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary resize-none"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-primary hover:bg-purple-600 transition-colors shadow-lg shadow-brand-primary/25 flex items-center gap-2"
          >
            <Check size={16} />
            {isEditing ? 'Update City' : 'Save City'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm, type = 'warning' }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${
          type === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-300">{message}</p>
          <p className="text-xs text-text-muted">This action will be logged in the system audit trail.</p>
        </div>
      </div>
      
      <div className="pt-6 mt-6 border-t border-white/10 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-colors shadow-lg ${
            type === 'danger' 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25' 
              : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
          }`}
        >
          Proceed
        </button>
      </div>
    </ModalWrapper>
  );
};
