import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, FileText, Check, AlertCircle } from 'lucide-react';

const ModalBackdrop = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      className="relative w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-10"
    >
      {children}
    </motion.div>
  </div>
);

export const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    await onExport(exportFormat);
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Download size={18} className="text-emerald-500" /> Export Report
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-600">Select export format:</p>
            {['pdf', 'excel', 'csv', 'print'].map(format => (
              <label key={format} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${exportFormat === format ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="format" 
                  value={format}
                  checked={exportFormat === format}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${exportFormat === format ? 'border-emerald-500' : 'border-gray-300'}`}>
                  {exportFormat === format && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">{format}</span>
              </label>
            ))}
          </div>

          <button 
            onClick={handleExport}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Export'}
          </button>
        </div>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

export const ScheduleReportModal = ({ isOpen, onClose, onSchedule }) => {
  const [frequency, setFrequency] = useState('weekly');
  const [delivery, setDelivery] = useState('email');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSchedule = async () => {
    setIsLoading(true);
    await onSchedule({ frequency, delivery });
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-brand-primary" /> Schedule Report
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Frequency</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand-primary transition-colors"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Delivery Method</label>
              <select 
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand-primary transition-colors"
              >
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSchedule}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-black uppercase tracking-wider hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Schedule'}
          </button>
        </div>
      </ModalBackdrop>
    </AnimatePresence>
  );
};

export const ReportGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
  const [reportType, setReportType] = useState('member');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    await onGenerate(reportType);
    setIsLoading(false);
    onClose();
  };

  const types = [
    { id: 'member', label: 'Member Report' },
    { id: 'verification', label: 'Verification Report' },
    { id: 'event', label: 'Event Report' },
    { id: 'matrimonial', label: 'Matrimonial Report' },
    { id: 'professional', label: 'Professional Report' },
    { id: 'engagement', label: 'Engagement Report' },
    { id: 'notification', label: 'Notification Report' },
  ];

  return (
    <AnimatePresence>
      <ModalBackdrop onClose={onClose}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" /> Generate Custom Report
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map(type => (
                 <button
                   key={type.id}
                   onClick={() => setReportType(type.id)}
                   className={`p-4 rounded-xl text-left border transition-all ${reportType === type.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                 >
                   <div className="flex items-center justify-between">
                     <span className={`text-sm font-bold ${reportType === type.id ? 'text-indigo-700' : 'text-gray-600'}`}>{type.label}</span>
                     {reportType === type.id && <Check size={14} className="text-indigo-400" />}
                   </div>
                 </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-black uppercase tracking-wider hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate Now'}
          </button>
        </div>
      </ModalBackdrop>
    </AnimatePresence>
  );
};
