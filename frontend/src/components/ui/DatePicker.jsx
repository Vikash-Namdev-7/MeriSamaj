import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DatePicker = ({ name, value, onChange, placeholder = "Select Date", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d)) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day, e) => {
    e.stopPropagation();
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const event = {
      target: {
        name: name,
        value: dateStr
      }
    };
    
    onChange(event);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center text-[10px] font-bold text-slate-400 mb-2">
          {day}
        </div>
      );
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = value === dateStr;
      
      const today = new Date();
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={(e) => handleDateClick(day, e)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all select-none ${
            isSelected
              ? 'bg-[#7C3AED] text-white shadow-md'
              : isToday
              ? 'text-[#7C3AED] font-bold bg-purple-50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const displayValue = value ? new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between cursor-pointer ${className} ${isOpen ? 'ring-2 ring-indigo-500/50 border-indigo-500' : ''}`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={16} className={isOpen ? "text-indigo-500" : "text-slate-400"} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-[calc(100%+8px)] left-0 w-[280px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="text-[14px] font-bold text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </div>
              
              <button 
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
               <button
                 type="button"
                 className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
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
                 className="text-[12px] font-bold text-[#7C3AED] cursor-pointer"
                 onClick={(e) => {
                   e.stopPropagation();
                   const today = new Date();
                   const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                   onChange({ target: { name, value: dateStr } });
                   setIsOpen(false);
                 }}
               >
                 Today
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
