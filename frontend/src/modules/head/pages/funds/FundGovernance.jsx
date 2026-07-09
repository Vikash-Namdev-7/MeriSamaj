import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, IndianRupee, Plus, FileText, ArrowRight, CheckCircle2, AlertCircle, X, ShieldAlert 
} from 'lucide-react';
import { useFund } from '../../../member/context/FundContext';
import { useData } from '../../../member/context/DataProvider';

export const FundGovernance = () => {
  const { funds, contributions, expenses, addFund } = useFund();
  const { members } = useData();
  const [activeModal, setActiveModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state for creating a new fund campaign
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    description: '',
    targetAmount: '',
    contributionPerMember: '',
    dueDate: ''
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateFund = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.contributionPerMember) {
      showToast('Please fill in required fields');
      return;
    }

    // Call addFund action
    addFund({
      name: formData.name,
      purpose: formData.purpose || 'Samaj Development Campaign',
      description: formData.description || 'Global project collection.',
      targetAmount: Number(formData.targetAmount),
      contributionPerMember: Number(formData.contributionPerMember),
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      assignedMembers: members.slice(0, 6).map(m => m.id) // assign to first 6 members as default list
    });

    showToast(`Successfully launched fund campaign: "${formData.name}"!`);
    setFormData({ name: '', purpose: '', description: '', targetAmount: '', contributionPerMember: '', dueDate: '' });
    setActiveModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* ─── TOAST ─── */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Wallet className="text-purple-400" />
            Central Treasury & Fund Governance
          </h2>
          <p className="text-xs text-text-muted mt-0.5">Approve budgets, initialize fund collections and audit operational expenses</p>
        </div>
        <button 
          onClick={() => setActiveModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus size={14} /> Launch Fund Campaign
        </button>
      </section>

      {/* ─── FUNDS LISTING ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {funds.map((fund) => {
          const fContribs = contributions[fund.id] || [];
          const fExpected = fContribs.reduce((acc, curr) => acc + (curr.assignedAmount || 0), 0);
          const fCollected = fContribs.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
          const percentage = fExpected > 0 ? Math.round((fCollected / fExpected) * 100) : 0;
          const fundExpenses = expenses[fund.id] || [];
          const totalExpenses = fundExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

          return (
            <div key={fund.id} className="card-neo p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/20 transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-md font-bold text-white leading-tight">{fund.name}</h3>
                    <p className="text-xs text-purple-300 mt-1 font-semibold">{fund.purpose}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    fund.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-text-muted border border-white/5'
                  }`}>
                    {fund.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-3 leading-relaxed">{fund.description}</p>
              </div>

              {/* Progress & Stats */}
              <div className="space-y-3.5 pt-3 border-t border-white/5">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-text-muted uppercase block">Target Goal</span>
                    <span className="text-sm font-black text-white mt-1 block">₹{fund.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-text-muted uppercase block">Collected</span>
                    <span className="text-sm font-black text-emerald-400 mt-1 block">₹{fCollected.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-text-muted uppercase block">Audited Exp.</span>
                    <span className="text-sm font-black text-rose-400 mt-1 block">₹{totalExpenses.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted font-bold mb-1.5">
                    <span>Collection Progress</span>
                    <span className="text-brand-secondary">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── AUDIT EXPENSES LISTING ─── */}
      <section className="card-neo p-5 space-y-4">
        <div>
          <h3 className="text-md font-black text-white flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            Central Audited Expenses Logs
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Review expenditure reports registered across campaigns</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/3">
          <table className="w-full text-left border-collapse text-xs text-white">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase text-text-muted tracking-wider bg-white/5">
                <th className="p-3.5">Expense Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Audited By</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {funds.flatMap(f => expenses[f.id] || []).map((exp, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="p-3.5 font-bold">{exp.title}</td>
                  <td className="p-3.5 text-purple-300 font-semibold">{exp.category || 'General'}</td>
                  <td className="p-3.5 text-text-muted">{exp.date}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {exp.addedBy}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-black text-rose-450">₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── CREATE FUND CAMPAIGN MODAL ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-purple-400 animate-pulse" />
                  Launch Samaj Development Campaign
                </h3>
                <button onClick={() => setActiveModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateFund} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Fund Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Samaj Bhawan Renovation Fund" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Purpose / Tag *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Upgrade Main Assembly Hall" 
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Target Goal (INR) *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 500000" 
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contribution/Member *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g., 2500" 
                      value={formData.contributionPerMember}
                      onChange={(e) => setFormData({...formData, contributionPerMember: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Campaign Details</label>
                  <textarea 
                    rows="3"
                    placeholder="Provide short detailed summary..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
                >
                  Authorize & Initialize Fund
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FundGovernance;
