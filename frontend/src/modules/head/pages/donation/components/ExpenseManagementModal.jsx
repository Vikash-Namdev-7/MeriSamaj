import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, IndianRupee, FileText } from 'lucide-react';

const ExpenseManagementModal = ({ isOpen, onClose, onSubmit, availableBalance }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.amount) > availableBalance) {
      setError('Expense amount cannot exceed the available balance.');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Record an Expense</h2>
              <p className="text-sm text-gray-500 mt-1">
                Available Balance: <span className="font-bold text-brand-primary">₹{availableBalance.toLocaleString()}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expense Title *</label>
              <input 
                type="text" 
                name="title" 
                required
                value={formData.title} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                placeholder="e.g. Building Materials"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  required
                  min="1"
                  max={Math.max(1, availableBalance)}
                  value={formData.amount} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  required
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary outline-none transition-all"
              >
                <option value="General">General</option>
                <option value="Construction">Construction</option>
                <option value="Medical Relief">Medical Relief</option>
                <option value="Event Cost">Event Cost</option>
                <option value="Marketing">Marketing / Printing</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                placeholder="Details of the expense..."
              ></textarea>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save size={18} /> Record Expense
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExpenseManagementModal;
