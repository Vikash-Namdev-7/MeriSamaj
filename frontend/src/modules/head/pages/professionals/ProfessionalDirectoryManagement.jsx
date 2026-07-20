import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, 
  MapPin, Calendar, Clock, AlertTriangle, Phone, Mail,
  Award, X, ShieldAlert, Check, ChevronLeft, ChevronRight,
  ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { professionalService } from '../../../../core/api/professionalService';

export default function ProfessionalDirectoryManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Stats & listings
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0, verified: 0, verificationPending: 0
  });

  // Filters loaded dynamically for this community
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    cities: []
  });

  // Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [credentialStatus, setCredentialStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 10;

  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 10, pages: 1
  });

  // Drawer / Modals
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [actionType, setActionType] = useState(null); // 'reject' | 'verify' | null
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyNote, setVerifyNote] = useState('');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFilterOptions = async () => {
    try {
      const res = await professionalService.headGetFilterOptions();
      if (res.success) {
        setFilterOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load local filter options:', err);
    }
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchQuery,
        status,
        category,
        city,
        credentialStatus,
        page: currentPage,
        limit,
        sortBy,
        sortOrder
      };
      const res = await professionalService.headGetListings(params);
      if (res.success) {
        setListings(res.data.listings);
        setPagination(res.data.pagination);
        setStats(res.data.statistics);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch community professional listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadListings();
  }, [searchQuery, status, category, city, credentialStatus, currentPage, sortBy, sortOrder]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatus('');
    setCategory('');
    setCity('');
    setCredentialStatus('');
    setCurrentPage(1);
  };

  const removeFilter = (key) => {
    if (key === 'status') setStatus('');
    if (key === 'category') setCategory('');
    if (key === 'city') setCity('');
    if (key === 'credential') setCredentialStatus('');
    setCurrentPage(1);
  };

  const viewDetails = async (id) => {
    setDrawerLoading(true);
    setIsDrawerOpen(true);
    try {
      const res = await professionalService.headGetListingById(id);
      if (res.success) {
        setSelectedListing(res.data);
      }
    } catch (err) {
      triggerToast('Failed to load listing details.', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await professionalService.headApproveListing(id);
      if (res.success) {
        triggerToast('Listing approved successfully.');
        loadListings();
        if (selectedListing && selectedListing.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Approval failed.', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      triggerToast('Rejection reason is required.', 'error');
      return;
    }
    try {
      const res = await professionalService.headRejectListing(selectedListing.id, rejectionReason);
      if (res.success) {
        triggerToast('Listing rejected successfully.');
        setActionType(null);
        setRejectionReason('');
        loadListings();
        viewDetails(selectedListing.id);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Rejection failed.', 'error');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await professionalService.headVerifyCredentials(selectedListing.id, verifyStatus, verifyNote);
      if (res.success) {
        triggerToast('Credentials verification updated successfully.');
        setActionType(null);
        setVerifyNote('');
        loadListings();
        viewDetails(selectedListing.id);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Verification update failed.', 'error');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this listing?')) return;
    try {
      const res = await professionalService.headSuspendListing(id);
      if (res.success) {
        triggerToast('Listing suspended successfully.');
        loadListings();
        if (selectedListing && selectedListing.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Suspension failed.', 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await professionalService.headRestoreListing(id);
      if (res.success) {
        triggerToast('Listing reactivated successfully.');
        loadListings();
        if (selectedListing && selectedListing.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Restoration failed.', 'error');
    }
  };

  const activeChips = [];
  if (status) activeChips.push({ label: `Status: ${status}`, key: 'status' });
  if (category) activeChips.push({ label: `Category: ${category}`, key: 'category' });
  if (city) activeChips.push({ label: `City: ${city}`, key: 'city' });
  if (credentialStatus) activeChips.push({ label: `Credentials: ${credentialStatus}`, key: 'credential' });

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans rounded-3xl">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3.5 rounded-xl shadow-lg text-white font-bold text-sm z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="text-[#7C3AED]" />
            Community Professional Desk
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Review listings, verify credentials, and manage professional registry inside your chapter.
          </p>
        </div>
        <button 
          onClick={loadListings}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-650 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Listings', val: stats.total, click: () => setStatus(''), color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Pending Approval', val: stats.pending, click: () => setStatus('Pending'), color: 'text-amber-600', bg: 'bg-white border-amber-200' },
          { label: 'Approved Active', val: stats.approved, click: () => setStatus('Approved'), color: 'text-emerald-600', bg: 'bg-white' },
          { label: 'Rejected Listings', val: stats.rejected, click: () => setStatus('Rejected'), color: 'text-rose-600', bg: 'bg-white' },
          { label: 'Suspended Listings', val: stats.suspended, click: () => setStatus('Suspended'), color: 'text-slate-500', bg: 'bg-white' },
          { label: 'Verified Credentials', val: stats.verified, click: () => setCredentialStatus('VERIFIED'), color: 'text-[#7C3AED]', bg: 'bg-purple-50/50 border-purple-100' }
        ].map((s, idx) => (
          <div 
            key={idx} 
            onClick={s.click}
            className={`p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all hover:border-slate-350 ${s.bg}`}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search local directory..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-[#7C3AED] focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <select 
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              value={city}
              onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select 
              value={credentialStatus}
              onChange={(e) => { setCredentialStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Credentials</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {activeChips.map((chip, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#7C3AED] text-[10px] font-black uppercase tracking-wider">
                {chip.label}
                <button onClick={() => removeFilter(chip.key)}><X size={10} /></button>
              </span>
            ))}
          </div>
          <button 
            onClick={clearAllFilters}
            className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Business Details</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Profession</th>
                <th className="p-4">Category</th>
                <th className="p-4">City</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Credentials</th>
                <th className="p-4 text-center">Submitted</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-650">
              {listings.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-900">{item.title}</td>
                  <td className="p-4">{item.owner?.name || 'Unknown'}</td>
                  <td className="p-4 text-xs text-slate-500">{item.profession}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.city}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.status === 'Pending' ? 'Pending Approval' : item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      item.credentialVerificationStatus === 'VERIFIED' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                      item.credentialVerificationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {item.credentialVerificationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-400 text-xs">
                    {new Date(item.createdDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <button 
                      onClick={() => viewDetails(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#7C3AED] hover:bg-purple-50/50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Eye size={12} /> Manage
                    </button>
                  </td>
                </tr>
              ))}

              {listings.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                    No business listings match filter conditions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button 
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* DETAIL DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="w-full max-w-xl bg-white border-l border-slate-250 shadow-2xl h-screen flex flex-col overflow-hidden relative">
            {drawerLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#7C3AED] rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-bold">Loading details...</p>
              </div>
            ) : selectedListing ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-100">
                      {selectedListing.category}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mt-2">{selectedListing.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{selectedListing.profession}</p>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Details Scroll */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Status Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Listing Status</p>
                      <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          selectedListing.status === 'Approved' ? 'bg-emerald-500' :
                          selectedListing.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                          'bg-rose-500'
                        }`} />
                        {selectedListing.status}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Credential Status</p>
                      <p className="text-sm font-black text-purple-750 mt-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#7C3AED]" />
                        {selectedListing.credentialVerificationStatus}
                      </p>
                    </div>
                  </div>

                  {/* Core Details */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider border-b border-slate-100 pb-1.5">Core Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Experience</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.experience} Years</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">City</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.city}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Working Hours</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.businessTiming || '09:00 AM - 08:00 PM'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] text-slate-400 uppercase">Work Address</p>
                        <p className="text-slate-805 mt-0.5">{selectedListing.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Contact */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider border-b border-slate-100 pb-1.5">Owner Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Name</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.owner?.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Chapter</p>
                        <p className="text-purple-700 mt-0.5">{selectedListing.community}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Phone</p>
                        <p className="text-slate-850 mt-0.5 flex items-center gap-1"><Phone size={10} /> {selectedListing.phone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Email</p>
                        <p className="text-slate-850 mt-0.5 flex items-center gap-1"><Mail size={10} /> {selectedListing.owner?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider border-b border-slate-100 pb-1.5">About Service / Description</h4>
                    <p className="text-xs leading-relaxed text-slate-650 font-semibold">{selectedListing.description}</p>
                  </div>

                  {/* Media Section */}
                  {selectedListing.media && selectedListing.media.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                      <h4 className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider border-b border-slate-100 pb-1.5">Media Gallery</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedListing.media.map((med, idx) => (
                          <div key={idx} className="relative aspect-square bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                            {med.type === 'video' ? (
                              <video src={med.url} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={med.url} alt="Listing upload" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audit Logs */}
                  {selectedListing.approval && (selectedListing.approval.approvedBy || selectedListing.approval.rejectedBy) && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3.5">
                      <h4 className="text-[10px] font-black text-slate-650 uppercase tracking-wider border-b border-slate-200 pb-1.5">Approval Audit Log</h4>
                      <div className="text-xs font-semibold text-slate-600 space-y-2">
                        {selectedListing.approval.approvedBy && (
                          <div>
                            <p className="text-emerald-700 font-bold">✓ Approved by {selectedListing.approval.approvedBy.name} ({selectedListing.approval.approvedBy.role})</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(selectedListing.approval.approvedAt).toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {selectedListing.approval.rejectedBy && (
                          <div>
                            <p className="text-rose-700 font-bold">✗ Rejected by {selectedListing.approval.rejectedBy.name} ({selectedListing.approval.rejectedBy.role})</p>
                            <p className="text-rose-600 text-[11px] mt-1 italic">Reason: "{selectedListing.approval.rejectionReason}"</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(selectedListing.approval.rejectedAt).toLocaleString('en-IN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Note logs */}
                  {selectedListing.verification && selectedListing.verification.verifiedBy && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3.5">
                      <h4 className="text-[10px] font-black text-slate-650 uppercase tracking-wider border-b border-slate-200 pb-1.5">Credential Verification Log</h4>
                      <div className="text-xs font-semibold text-slate-600">
                        <p className="text-[#7C3AED] font-bold flex items-center gap-1">
                          <ShieldCheck size={13} /> Verified by {selectedListing.verification.verifiedBy}
                        </p>
                        {selectedListing.verification.note && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">Notes: "{selectedListing.verification.note}"</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(selectedListing.verification.verifiedAt).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {selectedListing.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(selectedListing.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => setActionType('reject')}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {selectedListing.status === 'Approved' && (
                      <button 
                        onClick={() => handleSuspend(selectedListing.id)}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <ToggleLeft size={14} /> Suspend
                      </button>
                    )}
                    {selectedListing.status === 'Suspended' && (
                      <button 
                        onClick={() => handleRestore(selectedListing.id)}
                        className="bg-emerald-650 hover:bg-emerald-750 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <ToggleRight size={14} /> Reactivate
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setActionType('verify')}
                    className="border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white cursor-pointer"
                  >
                    <Award size={14} /> Verify Credentials
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {actionType === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-650" />
                Reject Application Request
              </h3>
              <button onClick={() => setActionType(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Rejection *</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Reason..." 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-xs text-slate-800 resize-none font-semibold"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-rose-150 hover:bg-opacity-90 cursor-pointer animate-pulse"
              >
                Confirm Rejection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {actionType === 'verify' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                <Award size={18} className="text-indigo-650" />
                Verify Credentials
              </h3>
              <button onClick={() => setActionType(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status *</label>
                <select 
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-xs text-slate-800 font-bold"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit notes / Comments</label>
                <textarea 
                  rows="3"
                  placeholder="Notes..." 
                  value={verifyNote}
                  onChange={(e) => setVerifyNote(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-xs text-slate-800 resize-none font-semibold"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-150 hover:bg-opacity-90 cursor-pointer"
              >
                Log Verification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
