import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useFund } from '../../context/FundContext';

export default function FundCreateAdminPage() {
  const navigate = useNavigate();
  const { addFund, mockUsers } = useFund();

  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    description: '',
    targetAmount: '',
    contributionPerMember: '',
    startDate: '',
    endDate: '',
    dueDate: ''
  });

  const [assignedMembers, setAssignedMembers] = useState(mockUsers.map(u => u.id));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMember = (id) => {
    if (assignedMembers.includes(id)) {
      setAssignedMembers(assignedMembers.filter(m => m !== id));
    } else {
      setAssignedMembers([...assignedMembers, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.contributionPerMember) {
      alert("Please fill all required fields.");
      return;
    }
    
    addFund({
      ...formData,
      targetAmount: Number(formData.targetAmount),
      contributionPerMember: Number(formData.contributionPerMember),
      assignedMembers
    });
    
    navigate('/member/fund');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-6 select-none">
      <div className="bg-white border-b border-slate-100 px-4 h-15 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[17px] font-black text-slate-800 tracking-tight">Create New Fund</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-[14px] font-black text-slate-800 border-b border-slate-100 pb-2">Fund Details</h2>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Fund Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-indigo-400" placeholder="e.g. Building Maintenance Fund" />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Purpose</label>
              <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium outline-none focus:border-indigo-400" placeholder="e.g. Annual maintenance and repair" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium outline-none focus:border-indigo-400 resize-none" placeholder="Detailed description..." />
            </div>
          </div>

          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-[14px] font-black text-slate-800 border-b border-slate-100 pb-2">Financials</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Target Amount (₹) *</label>
                <input required type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-indigo-400" placeholder="500000" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Per Member (₹) *</label>
                <input required type="number" name="contributionPerMember" value={formData.contributionPerMember} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-indigo-400" placeholder="2500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-[14px] font-black text-slate-800 border-b border-slate-100 pb-2">Schedule</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium outline-none focus:border-indigo-400" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-medium outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-[14px] font-black text-slate-800">Assign Members</h2>
              <span className="text-[12px] font-bold text-indigo-600">{assignedMembers.length} Selected</span>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {mockUsers.map(user => (
                <label key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                      {user.profilePic}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] font-medium text-slate-500">{user.phone}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={assignedMembers.includes(user.id)}
                    onChange={() => handleToggleMember(user.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black text-[15px] shadow-lg shadow-indigo-200 active:scale-[0.98] transition-transform">
            Create Fund
          </button>
        </form>
      </div>
    </div>
  );
}
