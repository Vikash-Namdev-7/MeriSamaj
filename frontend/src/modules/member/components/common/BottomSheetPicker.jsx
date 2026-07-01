import React from 'react';
import { X } from 'lucide-react';
import { BottomSheet } from '../layout/BottomSheet';

export const BottomSheetPicker = ({ 
  isOpen, 
  onClose, 
  title, 
  options, 
  selectedValue, 
  onSelect 
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1.5 pb-safe">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-[13.5px] font-extrabold transition-all border ${
              selectedValue === option.value 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'bg-white border-slate-150 text-slate-650 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};
