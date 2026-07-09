import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

export const CommunityHeadForm = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-[#1e1e2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-lg font-black text-white">Create Community Head</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body - Wizard Steps Placeholder */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-brand-primary text-white ring-4 ring-brand-primary/30' : 'bg-white/10 text-gray-500'}`}>
                    {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center py-10">
              <h3 className="text-xl font-bold text-white mb-2">Step {step} placeholder</h3>
              <p className="text-sm text-gray-400">Multi-step wizard content for Step {step} will go here.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <button 
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            {step < totalSteps ? (
              <button 
                onClick={() => setStep(prev => Math.min(totalSteps, prev + 1))}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-all"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={() => { onSubmit({}); onClose(); }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
              >
                Confirm & Create
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
