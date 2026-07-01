import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Send } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { PageHeader } from '../../components/layout/PageHeader';
import { AnimatedPage } from '../../components/layout/AnimatedPage';

const CreateObituaryPage = () => {
  const navigate = useNavigate();
  const { addObituary, currentUser } = useData();

  const [formData, setFormData] = useState({
    deceasedName: '',
    age: '',
    dateOfPassing: '',
    ritesType: 'Uthavna / Chautha',
    ritesDate: '',
    ritesTime: '',
    ritesVenue: '',
    message: 'With profound grief and sorrow, we inform you about the sad demise of our beloved family member.',
    relation: 'Family Member'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOb = {
      id: `ob-${Date.now()}`,
      deceasedName: formData.deceasedName,
      age: formData.age,
      dateOfPassing: formData.dateOfPassing,
      funeralDetails: {
        type: formData.ritesType,
        date: formData.ritesDate,
        time: formData.ritesTime,
        venue: formData.ritesVenue
      },
      message: formData.message,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        initials: currentUser.initials,
        relation: formData.relation
      },
      shraddhanjaliCount: 0,
      hasOfferedShraddhanjali: false,
      timestamp: 'Just now',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000' // Generic placeholder for mockup
    };

    addObituary(newOb);
    navigate('/member/obituaries', { replace: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatedPage>
      <PageHeader title="Post Shraddhanjali" />

      <div className="pt-20 pb-28 px-5 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Photo Upload Area */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-[24px] bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 mb-2 active:scale-95 transition-transform cursor-pointer">
              <Camera size={24} className="mb-1" />
              <span className="text-[10px] font-bold uppercase">Add Photo</span>
            </div>
            <p className="text-[12px] text-gray-500">Upload a photo of the departed soul</p>
          </div>

          <div className="space-y-4">
            {/* Deceased Details */}
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">Details</h3>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <input required type="text" name="deceasedName" value={formData.deceasedName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. Shri Ram Prasad Agrawal" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Age</label>
                  <input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. 75" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Date of Passing</label>
                  <input required type="text" name="dateOfPassing" value={formData.dateOfPassing} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. Aug 10, 2026" />
                </div>
              </div>
            </div>

            {/* Rites Details */}
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">Final Rites / Ceremony</h3>
              
              <div className="relative">
                <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Ceremony Type</label>
                <div className="relative">
                  <select name="ritesType" value={formData.ritesType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors appearance-none">
                    <option>Uthavna / Chautha</option>
                    <option>Pagdi Rasam</option>
                    <option>Besna</option>
                    <option>Tiharvi</option>
                    <option>Funeral</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Date</label>
                  <input type="text" name="ritesDate" value={formData.ritesDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. Aug 12" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Time</label>
                  <input type="text" name="ritesTime" value={formData.ritesTime} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. 4:00 PM" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Venue Address</label>
                <input type="text" name="ritesVenue" value={formData.ritesVenue} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. Swarg Mandir, M.G. Road" />
              </div>
            </div>

            {/* Message */}
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">Message</h3>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Your Relation</label>
                <input required type="text" name="relation" value={formData.relation} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors" placeholder="e.g. Son, Daughter, Nephew" />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase mb-1.5">Condolence Message</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-gray-400 focus:bg-white transition-colors resize-none" placeholder="Write a message..." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold text-[16px] flex items-center justify-center gap-2 press-scale">
            Post Announcement <Send size={18} />
          </button>
        </form>
      </div>
    </AnimatedPage>
  );
};

export default CreateObituaryPage;
