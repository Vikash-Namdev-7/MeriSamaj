import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, invitationTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X size={14} />
        </button>

        {/* Warning Icon */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 animate-pulse">
            <AlertTriangle size={24} />
          </div>
          
          {/* Text Content */}
          <h3 className="text-[16px] font-black text-slate-800">
            Delete Invitation?
          </h3>
          <p className="text-[12px] text-slate-500 font-semibold mt-2 px-3 leading-relaxed">
            Are you sure you want to delete <span className="text-slate-850 font-bold">"{invitationTitle}"</span>? This action is permanent and will completely remove it from the database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[13px] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-[13px] shadow-sm shadow-rose-200 transition-all press-scale flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} /> Yes, Delete
          </button>
        </div>

      </div>
    </div>
  );
}
