import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldBan, ShieldAlert, Trash2, CheckCircle } from 'lucide-react';

/**
 * Reusable confirmation/reason modal for status changes
 * Props:
 *   isOpen, onClose, onConfirm, type ('suspend'|'block'|'activate'|'delete'|'verify'), userName
 */
export const StatusChangeModal = ({ isOpen, onClose, onConfirm, type, userName, loading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const configs = {
    verify: {
      title: 'Verify Account',
      description: `Verify ${userName}'s account? This will mark their profile as verified and activate their account.`,
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
      btnLabel: 'Verify Account',
      needsReason: false,
    },
    suspend: {
      title: 'Suspend Account',
      description: `Temporarily suspend ${userName}'s account. They will not be able to log in. You can reactivate later.`,
      icon: ShieldAlert,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      btnLabel: 'Suspend Account',
      needsReason: true,
      reasonLabel: 'Reason for suspension',
      reasonPlaceholder: 'e.g. Violation of community guidelines...',
    },
    block: {
      title: 'Block Account',
      description: `Permanently block ${userName}'s account. This is a serious action — they will be completely locked out.`,
      icon: ShieldBan,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50',
      btnColor: 'bg-rose-600 hover:bg-rose-700',
      btnLabel: 'Block Account',
      needsReason: true,
      reasonLabel: 'Reason for blocking',
      reasonPlaceholder: 'e.g. Repeated violations, spam, abuse...',
    },
    activate: {
      title: 'Reactivate Account',
      description: `Reactivate ${userName}'s account? They will regain full access to the platform.`,
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
      btnLabel: 'Reactivate Account',
      needsReason: false,
    },
    delete: {
      title: 'Delete Account',
      description: `This will soft-delete ${userName}'s account. Their data will be preserved but the account will be deactivated.`,
      icon: Trash2,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      btnColor: 'bg-rose-700 hover:bg-rose-800',
      btnLabel: 'Delete Account',
      needsReason: false,
    },
  };

  const cfg = configs[type] || configs.activate;
  const Icon = cfg.icon;

  const handleConfirm = () => {
    if (cfg.needsReason && !reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    setError('');
    onConfirm(cfg.needsReason ? reason : undefined);
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[201] p-6"
          >
            <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
              <X size={18} />
            </button>

            {/* Icon */}
            <div className={`w-14 h-14 ${cfg.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
              <Icon size={28} className={cfg.iconColor} />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-2">{cfg.title}</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{cfg.description}</p>

            {cfg.needsReason && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">{cfg.reasonLabel}</label>
                <textarea
                  value={reason}
                  onChange={e => { setReason(e.target.value); setError(''); }}
                  placeholder={cfg.reasonPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-gray-800"
                />
                {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${cfg.btnColor}`}
              >
                {loading ? 'Processing...' : cfg.btnLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
