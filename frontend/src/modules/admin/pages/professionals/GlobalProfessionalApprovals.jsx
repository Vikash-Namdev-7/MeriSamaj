import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, RefreshCw, Eye, CheckCircle, XCircle, 
  MapPin, Calendar, Clock, AlertTriangle, Phone, Mail,
  X, Check, ShieldAlert
} from 'lucide-react';
import { professionalService } from '../../../../core/api/professionalService';

export default function GlobalProfessionalApprovals() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: ''
  });

  // Dynamic filter boundaries loaded from database
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    cities: []
  });

  // UI Drawer / Modal States
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [activeModal, setActiveModal] = useState(null); // 'reject' | null
  const [rejectionReason, setRejectionReason] = useState('');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFilterOptions = async () => {
    try {
      const res = await professionalService.adminGetFilterOptions();
      if (res.success) {
        setFilterOptions({
          categories: res.data.categories,
          cities: res.data.cities
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchQuery,
        status: 'Pending',
        category: filters.category,
        city: filters.city,
        limit: 100
      };
      const res = await professionalService.adminGetListings(params);
      if (res.success) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [searchQuery, filters.category, filters.city]);

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

  const handleApprove = async (id) => {
    try {
      const res = await professionalService.adminApproveListing(id);
      if (res.success) {
        triggerToast(res.message || 'Listing approved successfully.');
        setIsDrawerOpen(false);
        loadData();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to approve listing.', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      triggerToast('Rejection reason is required.', 'error');
      return;
    }
    try {
      const res = await professionalService.adminRejectListing(selectedListing.id, rejectionReason);
      if (res.success) {
        triggerToast('Listing rejected successfully.');
        setActiveModal(null);
        setRejectionReason('');
        setIsDrawerOpen(false);
        loadData();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to reject listing.', 'error');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans rounded-3xl">
      {/* Toast Notification */}
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
            Approval Queue Desk
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Review and action incoming professional listings pool.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-650 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="w-full md:flex-1 md:max-w-sm relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search pending applications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none text-slate-800"
            >
              <option value="">All</option>
              {filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">City</label>
            <select 
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none text-slate-800"
            >
              <option value="">All</option>
              {filterOptions.cities.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pending Applications List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Business Details</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Community</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Submission Date</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-650">
              {listings.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.profession} ({item.category})</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-805">{item.owner?.name || 'Unknown Member'}</p>
                    <p className="text-[10px] text-slate-450">{item.phone || item.owner?.phone}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                      {item.community}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-800">{item.city}</p>
                    <p className="text-[10px] text-slate-400">{item.experience} Years Exp</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse uppercase">
                      Pending Approval
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-450 text-xs">
                    {new Date(item.createdDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <button 
                      onClick={() => viewDetails(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Eye size={12} /> Review Application
                    </button>
                  </td>
                </tr>
              ))}

              {listings.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                    No pending directory applications currently awaiting review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="w-full max-w-xl bg-white border-l border-slate-250 shadow-2xl h-screen flex flex-col overflow-hidden relative">
            {drawerLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-650 rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-bold">Loading listing profile...</p>
              </div>
            ) : selectedListing ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex-1 min-w-0 pr-8">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-750 border border-indigo-100">
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
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Application Status</p>
                    <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Pending Review
                    </p>
                  </div>

                  {/* Core Details */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">Listing Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Experience</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.experience} Years</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">City</p>
                        <p className="text-slate-850 mt-0.5">{selectedListing.city}</p>
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
                        <p className="text-[9px] text-slate-400 uppercase">Phone Number</p>
                        <p className="text-slate-850 mt-0.5 flex items-center gap-1"><Phone size={10} /> {selectedListing.phone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase">Email ID</p>
                        <p className="text-slate-850 mt-0.5 flex items-center gap-1"><Mail size={10} /> {selectedListing.owner?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-1.5">About Service / Description</h4>
                    <p className="text-xs leading-relaxed text-slate-650 font-semibold">{selectedListing.description}</p>
                  </div>

                  {/* Media uploads */}
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
                </div>

                {/* Actions Bottom Bar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                  <button 
                    onClick={() => handleApprove(selectedListing.id)}
                    className="flex-1 bg-emerald-650 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-100"
                  >
                    <Check size={14} /> Approve Request
                  </button>
                  <button 
                    onClick={() => setActiveModal('reject')}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-100"
                  >
                    <X size={14} /> Reject Request
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {activeModal === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-650" />
                Reject Listing Request
              </h3>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Rejection *</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Provide feedback..." 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-xs text-slate-800 resize-none font-semibold"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-rose-200 hover:bg-opacity-90 animate-pulse"
              >
                Reject Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
