import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection';

export const PageHeader = ({ title, showBack = true, rightContent = null, autoHide = false }) => {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  
  const isHidden = autoHide && scrollDirection === 'down';

  return (
    <div 
      className={`responsive-fixed-top z-40 transition-all duration-300 ${
        isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ paddingTop: 'var(--spacing-safe-top)' }}
    >
      {/* Glass header with subtle purple tint */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30">
        <div className="flex items-center justify-between h-[56px] px-5">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={() => navigate(-1)} 
                className="press-scale w-9 h-9 -ml-1.5 rounded-xl bg-gray-50/80 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
            )}
            <h1 className="text-[17px] font-bold text-text-primary tracking-tight truncate">{title}</h1>
          </div>
          {rightContent && (
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
