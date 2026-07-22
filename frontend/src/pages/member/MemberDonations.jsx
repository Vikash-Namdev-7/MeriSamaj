import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Home, Heart, Search, Filter, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import memberDonationApi from '../../api/memberDonationApi';
import DonationCard from '../../components/member/DonationCard';
import DonateModal from '../../components/member/DonateModal';
import { useData } from '../../modules/member/context/DataProvider';

export const MemberDonations = () => {
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useData();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const fetchActiveDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await memberDonationApi.getActiveDonations(params);
      if (res.success) {
        setDonations(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load donation drives');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchActiveDonations();
  }, [fetchActiveDonations]);

  const handleOpenDonateModal = (donation) => {
    setSelectedDonation(donation);
    setIsDonateModalOpen(true);
  };

  const handleConfirmDonation = async (donationId, payload) => {
    try {
      setIsSubmitting(true);
      const res = await memberDonationApi.handleDonationPayment(donationId, payload);
      if (res.success) {
        setIsDonateModalOpen(false);
        setSelectedDonation(null);
        setSuccessToast(`Thank you! Your donation of ₹${payload.amount} was processed successfully.`);
        setTimeout(() => setSuccessToast(null), 5000);
        fetchActiveDonations();
      }
    } catch (err) {
      alert(err.message || 'Payment simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Causes' },
    { id: 'General', label: 'General Relief' },
    { id: 'Health', label: 'Health & Medical' },
    { id: 'Education', label: 'Education' },
    { id: 'Temple', label: 'Temple' },
    { id: 'Social', label: 'Social Welfare' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 font-sans">
      {/* Header Bar with Hamburger Menu & Home */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
            title="Open Menu"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold text-text-primary tracking-tight">Donations</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/member/home')}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
            title="Go to Home"
          >
            <Home size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 w-full flex-1">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-300" /> Community Welfare Drives
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Empower & Support Community Drives</h1>
          <p className="text-indigo-100 text-xs sm:text-sm">
            Your generous contributions directly fund medical emergencies, education scholarships, temple development, and community welfare initiatives.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between font-bold text-xs animate-in slide-in-from-top duration-300">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-white hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* Filter Category Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donation drives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Donation Cards */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading active donation drives...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
          <Heart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Active Donation Drives</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or try selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {donations.map((item) => (
            <DonationCard
              key={item._id}
              donation={item}
              onDonateClick={handleOpenDonateModal}
              onCardClick={(id) => navigate(`/member/donation/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Donate Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => { setIsDonateModalOpen(false); setSelectedDonation(null); }}
        donation={selectedDonation}
        onConfirmDonation={handleConfirmDonation}
        isSubmitting={isSubmitting}
      />
    </div>
  </div>
  );
};

export default MemberDonations;
