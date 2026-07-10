import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const TimePicker = ({ name, value, onChange, placeholder = "--:--", className = "", align = "left" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 12, minute: 0, ampm: 'PM' };
    const [h, m] = timeStr.split(':');
    let hr = parseInt(h, 10);
    const min = parseInt(m, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return { hour: hr, minute: min, ampm };
  };

  const [selectedTime, setSelectedTime] = useState(parseTime(value));
  const [mode, setMode] = useState('hour');

  useEffect(() => {
    if (value) setSelectedTime(parseTime(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (type, val, e) => {
    e.stopPropagation();
    const newTime = { ...selectedTime, [type]: val };
    setSelectedTime(newTime);
    
    if (type === 'hour') {
      setMode('minute');
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    let { hour, minute, ampm } = selectedTime;
    let hr24 = hour;
    if (ampm === 'PM' && hr24 !== 12) hr24 += 12;
    if (ampm === 'AM' && hr24 === 12) hr24 = 0;
    
    const timeStr = `${String(hr24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    onChange({ target: { name, value: timeStr } });
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return "";
    const { hour, minute, ampm } = parseTime(val);
    return `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => { setIsOpen(!isOpen); setMode('hour'); }}
        className={`flex items-center justify-between cursor-pointer ${className} ${isOpen ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {formatDisplay(value) || placeholder}
        </span>
        <Clock size={16} className={isOpen ? "text-indigo-500" : "text-slate-400"} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 top-[calc(100%+8px)] ${align === 'right' ? 'right-0' : 'left-0'} w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-4`}
          >
            <div className="flex items-center justify-center gap-2 mb-4 text-2xl font-bold">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setMode('hour'); }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${mode === 'hour' ? 'bg-purple-100 text-[#7C3AED]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {String(selectedTime.hour).padStart(2, '0')}
              </button>
              <span className="text-slate-300">:</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setMode('minute'); }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${mode === 'minute' ? 'bg-purple-100 text-[#7C3AED]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {String(selectedTime.minute).padStart(2, '0')}
              </button>
              <div className="flex flex-col ml-3 gap-1">
                <button 
                  type="button"
                  onClick={(e) => handleTimeChange('ampm', 'AM', e)}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${selectedTime.ampm === 'AM' ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-500'}`}
                >AM</button>
                <button 
                  type="button"
                  onClick={(e) => handleTimeChange('ampm', 'PM', e)}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${selectedTime.ampm === 'PM' ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-slate-500'}`}
                >PM</button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {mode === 'hour' 
                ? [1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={(e) => handleTimeChange('hour', h, e)}
                      className={`h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer select-none ${selectedTime.hour === h ? 'bg-[#7C3AED] text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED]'}`}
                    >{h}</button>
                  ))
                : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <button
                      key={`m-${m}`}
                      type="button"
                      onClick={(e) => handleTimeChange('minute', m, e)}
                      className={`h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer select-none ${selectedTime.minute === m ? 'bg-[#7C3AED] text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-[#7C3AED]'}`}
                    >{String(m).padStart(2, '0')}</button>
                  ))
              }
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex justify-between">
               <button
                 type="button"
                 className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer px-2 py-1"
                 onClick={(e) => {
                   e.stopPropagation();
                   onChange({ target: { name, value: '' } });
                   setIsOpen(false);
                 }}
               >
                 Clear
               </button>
               <button
                 type="button"
                 className="text-[13px] font-bold bg-[#7C3AED] text-white px-5 py-1.5 rounded-lg shadow-sm hover:bg-[#6D28D9] cursor-pointer"
                 onClick={handleApply}
               >
                 Apply
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimePicker;
