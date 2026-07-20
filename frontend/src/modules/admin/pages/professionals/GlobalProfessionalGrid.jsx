import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Briefcase, Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, 
  MapPin, Calendar, Clock, AlertTriangle, ChevronRight, Phone, Mail,
  Award, X, ShieldAlert, Check, ChevronLeft, ChevronRight as ChevronRightIcon,
  ArrowUpDown, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { professionalService } from '../../../../core/api/professionalService';

export default function GlobalProfessionalGrid() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const initialCred = searchParams.get('credentialStatus') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter options loaded from database
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    cities: [],
    communities: []
  });

  // Listings data
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters State
  const [status, setStatus] = useState(initialStatus);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [community, setCommunity] = useState('');
  const [credentialStatus, setCredentialStatus] = useState(initialCred);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 10;

  const [pagination, setPagination] = useState({
    total: 0, page: 1, limit: 10, pages: 1
  });

  // Detail Drawer State
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Modals State
  const [actionType, setActionType] = useState(null); // 'verify' | null
  const [verifyStatus, setVerifyStatus] = useState('VERIFIED');
  const [verifyNote, setVerifyNote] = useState('');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load master filter boundaries
  const loadFilterOptions = async () => {
    try {
      const res = await professionalService.adminGetFilterOptions();
      if (res.success) {
        setFilterOptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Load dynamic lists
  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchQuery,
        status,
        category,
        city,
        community,
        credentialStatus,
        fromDate,
        toDate,
        page: currentPage,
        limit,
        sortBy,
        sortOrder
      };

      const res = await professionalService.adminGetListings(params);
      if (res.success) {
        setListings(res.data.listings);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch business directory listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadListings();
  }, [
    searchQuery, status, category, city, community, 
    credentialStatus, fromDate, toDate, currentPage, sortBy, sortOrder
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatus('');
    setCategory('');
    setCity('');
    setCommunity('');
    setCredentialStatus('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const removeFilter = (filterKey) => {
    if (filterKey === 'status') setStatus('');
    if (filterKey === 'category') setCategory('');
    if (filterKey === 'city') setCity('');
    if (filterKey === 'community') setCommunity('');
    if (filterKey === 'credential') setCredentialStatus('');
    if (filterKey === 'date') {
      setFromDate('');
      setToDate('');
    }
    setCurrentPage(1);
  };

  const viewDetails = async (id) => {
    setDrawerLoading(true);
    setIsDrawerOpen(true);
    try {
      const res = await professionalService.adminGetListingById(id);
      if (res.success) {
        setSelectedListing(res.data);
      }
    } catch (err) {
      triggerToast('Failed to load listing details.', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await professionalService.adminVerifyCredentials(selectedListing.id, verifyStatus, verifyNote);
      if (res.success) {
        triggerToast('Credentials updated successfully.');
        setActionType(null);
        setVerifyNote('');
        loadListings();
        viewDetails(selectedListing.id);
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to update credentials.', 'error');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this approved business listing?')) return;
    try {
      const res = await professionalService.adminSuspendListing(id);
      if (res.success) {
        triggerToast('Listing suspended successfully.');
        loadListings();
        if (selectedListing && selectedListing.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to suspend listing.', 'error');
    }
  };

  const handleReactivate = async (id) => {
    try {
      const res = await professionalService.adminReactivateListing(id);
      if (res.success) {
        triggerToast('Listing reactivated successfully.');
        loadListings();
        if (selectedListing && selectedListing.id === id) {
          viewDetails(id);
        }
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to reactivate listing.', 'error');
    }
  };

  // Detect active filter chips
  const activeChips = [];
  if (status) activeChips.push({ label: `Status: ${status}`, key: 'status' });
  if (category) activeChips.push({ label: `Category: ${category}`, key: 'category' });
  if (city) activeChips.push({ label: `City: ${city}`, key: 'city' });
  if (community) {
    const matched = filterOptions.communities.find(c => c.id === community);
    activeChips.push({ label: `Community: ${matched ? matched.name : community}`, key: 'community' });
  }
  if (credentialStatus) activeChips.push({ label: `Credentials: ${credentialStatus}`, key: 'credential' });
  if (fromDate || toDate) activeChips.push({ label: `Dates: ${fromDate || '*'} to ${toDate || '*'}`, key: 'date' });

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans rounded-3xl">
      {/* Toast notifications */}
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
            <Briefcase className="text-indigo-650" />
            Global Directory Grid
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Review listing tables, verify licenses, and activate/deactivate listings.
          </p>
        </div>
        <button 
          onClick={loadListings}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-650 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Advanced Filter controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search business, owner, city..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="space-y-1">
            <select 
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <select 
              value={city}
              onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <select 
              value={community}
              onChange={(e) => { setCommunity(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Communities</option>
              {filterOptions.communities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <select 
              value={credentialStatus}
              onChange={(e) => { setCredentialStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-slate-800"
            >
              <option value="">All Credentials</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <button 
              onClick={clearAllFilters}
              className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-250 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {activeChips.map((chip, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                {chip.label}
                <button onClick={() => removeFilter(chip.key)}>
                  <X size={10} className="text-indigo-400 hover:text-indigo-650" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid listing Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Business Details</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Profession</th>
                <th className="p-4">Category</th>
                <th className="p-4">Community</th>
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
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                      {item.community}
                    </span>
                  </td>
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
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </td>
                </tr>
              ))}

              {listings.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-bold">
                    No business listings match filter conditions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
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
            Next <ChevronRightIcon size={14} />
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
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-650 rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-bold">Loading details...</p>
              </div>
            ) : selectedListing ? (
              <>
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
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
                      <p className="text-sm font-black text-indigo-750 mt-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-indigo-650" />
                        {selectedListing.credentialVerificationStatus}
                      </p>
                    </div>
                  </div>

                  {/* Core Details */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">Core Details</h4>
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
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">Owner Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Name</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.owner?.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Community Chapter</p>
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
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">About Service / Description</h4>
                    <p className="text-xs leading-relaxed text-slate-650 font-semibold">{selectedListing.description}</p>
                  </div>

                  {/* Media Gallery */}
                  {selectedListing.media && selectedListing.media.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                      <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">Media Uploads</h4>
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

                  {/* Credential Notes */}
                  {selectedListing.verification && selectedListing.verification.verifiedBy && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3.5">
                      <h4 className="text-[10px] font-black text-slate-650 uppercase tracking-wider border-b border-slate-200 pb-1.5">Credential Verification Log</h4>
                      <div className="text-xs font-semibold text-slate-650">
                        <p className="text-indigo-700 font-bold flex items-center gap-1">
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
                    {selectedListing.status === 'Approved' ? (
                      <button 
                        onClick={() => handleSuspend(selectedListing.id)}
                        className="bg-slate-650 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <ToggleLeft size={15} /> Suspend Listing
                      </button>
                    ) : selectedListing.status === 'Suspended' ? (
                      <button 
                        onClick={() => handleReactivate(selectedListing.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <ToggleRight size={15} /> Reactivate Listing
                      </button>
                    ) : null}
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

      {/* VERIFY MODAL */}
      {actionType === 'verify' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                <Award size={18} className="text-indigo-650" />
                Audit Credentials
              </h3>
              <button onClick={() => setActionType(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200">
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Comments / Notes</label>
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
                className="w-full py-3 rounded-xl bg-indigo-650 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-indigo-200"
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
