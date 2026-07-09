import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, Heart, Calendar, Search, ShieldAlert, Sparkles, Send, Plus, 
  ChevronRight, X, Eye, MapPin, Clock, ArrowUpRight, BarChart3, FileText, Check, 
  AlertCircle, RefreshCw, Trash2, ShieldCheck, Filter, Download, Grid, List, 
  EyeOff, AlertTriangle, ArrowUpDown, ChevronDown, UserPlus, HelpCircle
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { Avatar } from '../../../member/components/common/Avatar';

export const MemberManagement = () => {
  const { members, verifyMember, rejectMember } = useData();

  // Local state representing the local scope of members for the current Samaj (head's community)
  const headCommunityName = "Agrawal Samaj Indore";
  const communityMembers = useMemo(() => {
    // Dynamically scoped to matching community or simulated local Samaj subset for the Head
    return members.map(m => ({
      ...m,
      memberId: m.memberId || `AS-${1000 + Number(m.id || 1)}`,
      email: m.email || `${m.name.toLowerCase().replace(/\s/g, '')}@gmail.com`,
      gender: m.gender || (Number(m.id) % 2 === 0 ? 'Female' : 'Male'),
      ageGroup: m.ageGroup || (Number(m.id) % 3 === 0 ? 'Senior (60+)' : Number(m.id) % 3 === 1 ? 'Youth (18-35)' : 'Adult (36-59)'),
      maritalStatus: m.maritalStatus || (Number(m.id) % 2 === 0 ? 'Unmarried' : 'Married'),
      bloodGroup: m.bloodGroup || (Number(m.id) % 4 === 0 ? 'B+' : Number(m.id) % 4 === 1 ? 'A+' : 'O+'),
      familySize: m.familySize || (Number(m.id) % 3 + 2),
      registrationDate: m.registrationDate || '2026-06-12',
      lastActive: m.lastActive || '2 Hrs ago',
      area: m.area || (Number(m.id) % 2 === 0 ? 'Vijay Nagar' : 'Saket'),
      familyMembers: m.familyMembers || [
        { name: `${m.name.split(' ')[0]}'s Spouse`, relationship: 'Spouse', occupation: 'Homemaker', age: 34, isVerified: true },
        { name: `${m.name.split(' ')[0]}'s Child`, relationship: 'Son', occupation: 'Student', age: 12, isVerified: false }
      ],
      activities: [
        { date: '2026-07-06', time: '11:20 AM', action: 'Log In', status: 'Success', device: 'Chrome / Windows', location: 'Indore, India' },
        { date: '2026-07-05', time: '04:15 PM', action: 'Profile Update', status: 'Success', device: 'Safari / iPhone', location: 'Indore, India' }
      ]
    }));
  }, [members]);

  // Tab View Mode
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'directory'

  // Advanced Filters States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: 'all',
    area: 'all',
    gender: 'all',
    ageGroup: 'all',
    profession: 'all',
    maritalStatus: 'all',
    bloodGroup: 'all',
    verification: 'all',
    familySize: 'all'
  });
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'alphabetical' | 'active'

  // Selection & UI States
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeDrawerMember, setActiveDrawerMember] = useState(null); // Member object for profile drawer
  const [activeModal, setActiveModal] = useState(null); // 'add' | 'verify_doc' | 'status_confirm' | 'bulk_action' | null
  const [selectedMemberForStatus, setSelectedMemberForStatus] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State for Adding Member
  const [addForm, setAddForm] = useState({
    name: '', phone: '', city: '', profession: '', gender: 'Male', ageGroup: 'Adult (36-59)', maritalStatus: 'Married', bloodGroup: 'O+'
  });

  // Details drawer active tab
  const [drawerTab, setDrawerTab] = useState('profile'); // 'profile' | 'family' | 'activities'

  // Document verification modal state
  const [verificationDoc, setVerificationDoc] = useState(null);

  // Toast Trigger Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter Reset
  const handleResetFilters = () => {
    setFilters({
      city: 'all', area: 'all', gender: 'all', ageGroup: 'all', profession: 'all', maritalStatus: 'all', bloodGroup: 'all', verification: 'all', familySize: 'all'
    });
    setSearchQuery('');
    showToast('Filters reset successfully');
  };

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    let result = communityMembers.filter(m => {
      const matchText = searchQuery.trim().toLowerCase();
      const matchesSearch = !matchText || 
                            m.name.toLowerCase().includes(matchText) ||
                            m.phone.includes(matchText) ||
                            m.memberId.toLowerCase().includes(matchText) ||
                            m.email.toLowerCase().includes(matchText);

      const matchesCity = filters.city === 'all' || m.city.toLowerCase() === filters.city.toLowerCase();
      const matchesArea = filters.area === 'all' || m.area.toLowerCase() === filters.area.toLowerCase();
      const matchesGender = filters.gender === 'all' || m.gender === filters.gender;
      const matchesAge = filters.ageGroup === 'all' || m.ageGroup === filters.ageGroup;
      const matchesProfession = filters.profession === 'all' || (m.profession && m.profession.toLowerCase() === filters.profession.toLowerCase());
      const matchesMarital = filters.maritalStatus === 'all' || m.maritalStatus === filters.maritalStatus;
      const matchesBlood = filters.bloodGroup === 'all' || m.bloodGroup === filters.bloodGroup;
      const matchesVerification = filters.verification === 'all' || 
                                 (filters.verification === 'verified' && m.isVerified) || 
                                 (filters.verification === 'pending' && !m.isVerified);

      return matchesSearch && matchesCity && matchesArea && matchesGender && matchesAge && matchesProfession && matchesMarital && matchesBlood && matchesVerification;
    });

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [communityMembers, searchQuery, filters, sortBy]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = communityMembers.length;
    const pending = communityMembers.filter(m => !m.isVerified).length;
    const verified = communityMembers.filter(m => m.isVerified).length;
    const active = communityMembers.filter(m => !m.suspended).length; // active if not suspended in mock
    return { total, pending, verified, active };
  }, [communityMembers]);

  // Bulk operation handlers
  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      showToast('Select members first');
      return;
    }
    if (action === 'verify') {
      selectedIds.forEach(id => verifyMember(id));
      showToast(`Bulk verified ${selectedIds.length} members successfully!`);
    } else if (action === 'suspend') {
      showToast(`Bulk suspended ${selectedIds.length} members successfully!`);
    } else if (action === 'activate') {
      showToast(`Bulk activated ${selectedIds.length} members!`);
    }
    setSelectedIds([]);
  };

  // Add Member submit
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone) {
      showToast('Please fill in required fields');
      return;
    }

    // In a real app we would call context.addMember, here we mock a success response
    showToast(`Successfully registered ${addForm.name} to community!`);
    setAddForm({ name: '', phone: '', city: '', profession: '', gender: 'Male', ageGroup: 'Adult (36-59)', maritalStatus: 'Married', bloodGroup: 'O+' });
    setActiveModal(null);
  };

  // Status adjustment callback with confirmation prompt
  const triggerStatusChange = (member, status) => {
    setSelectedMemberForStatus(member);
    setTargetStatus(status);
    setActiveModal('status_confirm');
  };

  const confirmStatusChange = () => {
    if (targetStatus === 'verify') {
      verifyMember(selectedMemberForStatus.id);
      showToast(`Account verified for ${selectedMemberForStatus.name}!`);
    } else if (targetStatus === 'suspend') {
      showToast(`Account suspended for ${selectedMemberForStatus.name}`);
    } else if (targetStatus === 'activate') {
      showToast(`Account activated for ${selectedMemberForStatus.name}`);
    } else if (targetStatus === 'remove') {
      showToast(`Account soft-deleted for ${selectedMemberForStatus.name}`);
    }
    setActiveModal(null);
  };

  // Export engine
  const handleExport = (format) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredMembers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `samaj_members_export.${format.toLowerCase()}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${filteredMembers.length} records in ${format} format!`);
  };

  return (
    <div className="space-y-6 pb-16 relative text-black [&_*]:!text-black">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md animate-fade-in font-bold text-xs tracking-wider">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {/* ─── PAGE HEADER & STATS ─── */}
      <section className="card-neo p-6 relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="text-purple-400" />
              Member Directory Governance
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Council Head Executive Panel: {headCommunityName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveModal('add')}
              className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow"
            >
              <UserPlus size={14} /> Add Member
            </button>
            
            {/* Export options */}
            <div className="relative group">
              <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/5 flex items-center gap-2">
                <Download size={14} /> Export <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-xl overflow-hidden shadow-2xl invisible group-hover:visible z-20">
                {['CSV', 'Excel', 'PDF'].map((fmt) => (
                  <button 
                    key={fmt}
                    onClick={() => handleExport(fmt)}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-purple-200 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Export as {fmt}
                  </button>
                ))}
                <button 
                  onClick={() => window.print()}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-purple-200 border-t border-white/5 hover:bg-white/5 hover:text-white transition-all"
                >
                  Print Directory
                </button>
              </div>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-white'}`}
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('directory')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'directory' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-white'}`}
              >
                <Grid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic counters grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Samaj Members</span>
            <h3 className="text-xl font-black text-white mt-1">{stats.total}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Approvals</span>
            <h3 className="text-xl font-black text-amber-400 mt-1">{stats.pending}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified Accounts</span>
            <h3 className="text-xl font-black text-emerald-400 mt-1">{stats.verified}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Active Members</span>
            <h3 className="text-xl font-black text-purple-200 mt-1">{stats.active}</h3>
          </div>
        </div>

      </section>

      {/* ─── FILTERS & CONTROLS ─── */}
      <section className="card-neo p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search directory by Name, Mobile, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-brand-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* City */}
            <select 
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-purple-200 outline-none focus:border-brand-primary"
            >
              <option value="all">All Cities</option>
              <option value="indore">Indore</option>
              <option value="bhopal">Bhopal</option>
              <option value="ujjain">Ujjain</option>
            </select>

            {/* Gender */}
            <select 
              value={filters.gender}
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-purple-200 outline-none focus:border-brand-primary"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Verification */}
            <select 
              value={filters.verification}
              onChange={(e) => setFilters({...filters, verification: e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-purple-200 outline-none focus:border-brand-primary"
            >
              <option value="all">Verification Status</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>

            {/* Sorting */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-purple-200 outline-none focus:border-brand-primary"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="alphabetical">Sort: A-Z</option>
            </select>
          </div>
        </div>

        {/* Filter Action panel */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Filtered: {filteredMembers.length} Accounts found</span>
          <button 
            onClick={handleResetFilters}
            className="text-[10px] font-black text-rose-400 hover:text-white uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* ─── STICKY BULK ACTIONS BAR ─── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 border border-purple-500/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-bold text-white animate-slide-up">
          <span>{selectedIds.length} members selected</span>
          <div className="h-4 w-[1px] bg-white/15" />
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('verify')} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/25">Approve</button>
            <button onClick={() => handleBulkAction('suspend')} className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white rounded-lg transition-all border border-amber-500/25">Suspend</button>
            <button onClick={() => setSelectedIds([])} className="px-2 py-1 text-text-muted hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── PRIMARY CONTENT SWITCH ─── */}
      {viewMode === 'table' ? (
        /* TABLE LIST VIEW */
        <div className="card-neo p-5 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/3">
            <table className="w-full text-left border-collapse text-xs text-white">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black uppercase text-text-muted tracking-wider bg-white/5">
                  <th className="p-3.5 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredMembers.map(m => m.id));
                        else setSelectedIds([]);
                      }}
                      className="w-4 h-4 rounded bg-white/5 border-white/10 accent-purple-600"
                    />
                  </th>
                  <th className="p-3.5">Member Details</th>
                  <th className="p-3.5">Member ID</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Family size</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-text-muted">
                      No members match the query filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isChecked = selectedIds.includes(member.id);
                    return (
                      <tr key={member.id} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) setSelectedIds(selectedIds.filter(id => id !== member.id));
                              else setSelectedIds([...selectedIds, member.id]);
                            }}
                            className="w-4 h-4 rounded bg-white/5 border-white/10 accent-purple-600"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar initials={member.initials} size="sm" imageUrl={member.avatar} />
                            <div>
                              <h4 className="font-bold text-white leading-tight">{member.name}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5">{member.city} • {member.profession || 'Business'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono tracking-wider text-purple-300 font-bold">{member.memberId}</td>
                        <td className="p-3.5">
                          <p className="text-white font-bold">{member.phone}</p>
                          <p className="text-[9px] text-text-muted font-medium mt-0.5">{member.email}</p>
                        </td>
                        <td className="p-3.5 font-bold">{member.familySize} Members</td>
                        <td className="p-3.5">
                          {member.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck size={9} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                              <AlertCircle size={9} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setActiveDrawerMember(member)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-primary text-purple-200 hover:text-white transition-all"
                            >
                              <Eye size={12} />
                            </button>
                            {!member.isVerified ? (
                              <button 
                                onClick={() => setVerificationDoc(member)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-350 hover:text-white border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                Audit
                              </button>
                            ) : (
                              <button 
                                onClick={() => triggerStatusChange(member, 'suspend')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-350 hover:text-white border border-rose-500/25 text-[10px] font-bold transition-all"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW DIRECTORY */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="card-neo p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/20 transition-all">
              <div className="flex items-start gap-4">
                <Avatar initials={member.initials} size="md" imageUrl={member.avatar} />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate leading-tight">{member.name}</h4>
                  <p className="text-xs text-brand-secondary font-semibold mt-0.5 truncate">{member.profession || 'Business'}</p>
                  <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1"><MapPin size={10} /> {member.city}</p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-white/5 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[9px] text-text-muted font-bold uppercase block">Family Count</span>
                  <span className="font-bold text-white mt-0.5 block">{member.familySize} Members</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[9px] text-text-muted font-bold uppercase block">Verification</span>
                  <span className={`font-bold mt-0.5 block ${member.isVerified ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                    {member.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex gap-2">
                <button 
                  onClick={() => setActiveDrawerMember(member)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                >
                  View Profile
                </button>
                {!member.isVerified && (
                  <button 
                    onClick={() => setVerificationDoc(member)}
                    className="flex-1 py-2 text-xs font-black text-white bg-brand-primary hover:bg-purple-600 rounded-xl transition-all shadow"
                  >
                    Audit Credentials
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MEMBER DETAILS VIEW SIDE DRAWER ─── */}
      <AnimatePresence>
        {activeDrawerMember && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawerMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide Box */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg h-full bg-gradient-to-b from-[#0f072e] via-[#160b37] to-[#1e1045] border-l border-white/10 shadow-2xl relative z-10 flex flex-col p-6 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={activeDrawerMember.initials} size="md" imageUrl={activeDrawerMember.avatar} />
                  <div>
                    <h3 className="text-md font-black text-white">{activeDrawerMember.name}</h3>
                    <p className="text-[10px] text-brand-secondary font-bold tracking-widest uppercase">{activeDrawerMember.memberId}</p>
                  </div>
                </div>
                <button onClick={() => setActiveDrawerMember(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-white/5 mb-4">
                {['profile', 'family', 'activities'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                      drawerTab === tab ? 'text-white' : 'text-text-muted hover:text-purple-300'
                    }`}
                  >
                    {tab}
                    {drawerTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Scrollable Contents */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {drawerTab === 'profile' && (
                  <div className="space-y-4 text-xs text-purple-200">
                    <div className="card-neo p-4 space-y-2">
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-brand-secondary">Contact details</h4>
                      <p><strong>Mobile:</strong> {activeDrawerMember.phone}</p>
                      <p><strong>Email:</strong> {activeDrawerMember.email}</p>
                      <p><strong>Gotra/Sub-gotra:</strong> Garg / Agrawal</p>
                      <p><strong>Blood Group:</strong> {activeDrawerMember.bloodGroup}</p>
                    </div>

                    <div className="card-neo p-4 space-y-2">
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-brand-secondary">Profession Details</h4>
                      <p><strong>Profession:</strong> {activeDrawerMember.profession || 'CA'}</p>
                      <p><strong>Location:</strong> {activeDrawerMember.area}, {activeDrawerMember.city}</p>
                    </div>
                  </div>
                )}

                {drawerTab === 'family' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-brand-secondary flex items-center justify-between">
                      <span>Family Tree Nodes</span>
                      <button onClick={() => showToast('Redirected to node configuration')} className="text-[9px] text-purple-300 uppercase">+ Add node</button>
                    </h4>
                    
                    {activeDrawerMember.familyMembers.map((fm, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between text-xs text-white">
                        <div>
                          <p className="font-bold">{fm.name}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{fm.relationship} • {fm.occupation} • Age: {fm.age}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${fm.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {fm.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'activities' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-brand-secondary">Auditable activity timeline</h4>
                    <div className="space-y-3 relative pl-4 border-l border-white/10 ml-2">
                      {activeDrawerMember.activities.map((act, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-surface" />
                          <div className="p-3 rounded-2xl bg-white/3 border border-white/5 text-xs text-purple-200">
                            <span className="font-bold text-white">{act.action}</span>
                            <span className="text-[9px] text-text-muted block mt-0.5">{act.date} {act.time} • {act.device}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action commands */}
              <div className="border-t border-white/5 pt-4 mt-auto flex gap-3">
                <button 
                  onClick={() => triggerStatusChange(activeDrawerMember, 'suspend')}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/15 text-rose-350 font-bold border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-center text-xs"
                >
                  Suspend Account
                </button>
                <button 
                  onClick={() => triggerStatusChange(activeDrawerMember, 'verify')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-350 font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-center text-xs"
                >
                  Verify Member
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DOCUMENT VERIFICATION ARCHIVE DRAWER ─── */}
      <AnimatePresence>
        {verificationDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVerificationDoc(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-md font-black text-white">Document Audit Desk</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Auditing: {verificationDoc.name}</p>
                </div>
                <button onClick={() => setVerificationDoc(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-950 p-4 border border-white/10 flex flex-col justify-between text-white select-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full filter blur-xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-bold tracking-wider text-purple-300">INDORE SAMAJ ARCHIVE</h4>
                    <p className="text-[7px] text-purple-400 font-bold uppercase mt-0.5">Identity Verification Card</p>
                  </div>
                  <span className="w-6 h-6 rounded bg-amber-500/20 text-[9px] flex items-center justify-center">🇮🇳</span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <Avatar initials={verificationDoc.initials} size="md" />
                  <div>
                    <p className="text-xs font-bold">{verificationDoc.name}</p>
                    <p className="text-[8px] text-purple-300">City: {verificationDoc.city}</p>
                    <p className="text-[8px] text-purple-300">S/o or W/o Details Attached</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[9px] font-mono tracking-widest text-purple-300/80">
                  <span>9024 1002 9948</span>
                  <span className="text-[7px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans font-bold">DIGI-SIGNED</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => handleReject(verificationDoc.id, verificationDoc.name)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-350 text-xs font-bold border border-rose-500/20 active:scale-95 transition-all text-center"
                >
                  Reject Proof
                </button>
                <button 
                  onClick={() => handleVerify(verificationDoc.id, verificationDoc.name)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold active:scale-95 transition-all text-center"
                >
                  Approve & Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CONFIRMATION STATE CHANGE MODAL ─── */}
      <AnimatePresence>
        {activeModal === 'status_confirm' && selectedMemberForStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle size={24} className="animate-pulse" />
                <h3 className="text-md font-black text-white">Confirm Action</h3>
              </div>

              <p className="text-xs text-purple-200 leading-relaxed">
                Are you sure you want to change the status of <strong>{selectedMemberForStatus.name}</strong> to: <strong>{targetStatus}</strong>? This action updates directory databases and triggers system notifications.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/5 transition-all text-center"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmStatusChange}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold active:scale-95 transition-all text-center"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD MEMBER POPUP MODAL ─── */}
      <AnimatePresence>
        {activeModal === 'add' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-purple-400" />
                  Add Community Member
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Rajesh Kumar Agrawal" 
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Mobile Number *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g., +91 90248 12848" 
                    value={addForm.phone}
                    onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">City Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Indore" 
                      value={addForm.city}
                      onChange={(e) => setAddForm({...addForm, city: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Profession</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Software Architect" 
                      value={addForm.profession}
                      onChange={(e) => setAddForm({...addForm, profession: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
                >
                  Register Member Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MemberManagement;
