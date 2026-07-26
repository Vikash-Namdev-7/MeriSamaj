import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  User, 
  Tag, 
  Flame, 
  Clock, 
  Wallet,
  Globe
} from 'lucide-react';
import memberDonationApi from '../../api/memberDonationApi';
import DonateModal from '../../components/member/DonateModal';
import { useData } from '../../modules/member/context/DataProvider';
import { useAuth } from '../../core/auth/useAuth';
import { loadRazorpayScript } from '../../core/utils/razorpayLoader';

export const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useData();
  const { user: authUser } = useAuth();
  const activeUser = currentUser || authUser;

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await memberDonationApi.getDonationById(id);
      if (res.success || res.status === 'success') {
        setDonation(res.data);
      }
    } catch (err) {
      setError(err.message || 'Donation drive not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleConfirmDonation = async (donationId, payload) => {
    try {
      setIsSubmitting(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay Payment Gateway SDK failed to load. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const targetId = donationId || id;
      const orderRes = await memberDonationApi.createRazorpayOrder(targetId, {
        amount: payload.amount,
        donorName: payload.donorName
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order.');
      }

      const { order_id, amount, currency, key } = orderRes.data;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || 'INR',
        name: 'Meri Samaj Donation',
        description: `Donation for ${donation?.title || 'Noble Cause'}`,
        order_id: order_id,
        prefill: {
          name: payload.donorName || activeUser?.name || '',
          email: activeUser?.email || '',
          contact: activeUser?.phone || activeUser?.mobile || ''
        },
        theme: {
          color: '#4F46E5'
        },
        handler: async (response) => {
          try {
            const verifyRes = await memberDonationApi.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              donationId: targetId,
              amount: payload.amount,
              donorName: payload.donorName
            });

            if (verifyRes.success || verifyRes.status === 'success') {
              setIsDonateModalOpen(false);
              setSuccessToast(`Thank you! Your donation of ₹${payload.amount.toLocaleString()} was processed successfully.`);
              setTimeout(() => setSuccessToast(null), 5000);
              await fetchDetails();
            } else {
              alert(verifyRes.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            alert(verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setSuccessToast(null);
            alert('Payment cancelled.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        setIsSubmitting(false);
        alert(response.error?.description || 'Payment failed. Please try again.');
      });
      razorpayInstance.open();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Donation Campaign Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'This campaign may have been closed or deleted.'}</p>
          <button
            onClick={() => navigate('/member/donation')}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-all"
          >
            Back to All Donations
          </button>
        </div>
      </div>
    );
  }

  const raised = donation.raisedAmount || donation.collectedAmount || 0;
  const target = donation.targetAmount || 1;
  const percentage = Math.min(100, Math.round((raised / target) * 100));
  const createdByName = donation.createdBy?.name || 'Community Management';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 font-sans max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/member/donation')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Drives
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between font-bold text-xs">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-white hover:opacity-80">Dismiss</button>
        </div>
      )}

      {/* Main Campaign Card */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl space-y-6 pb-6">
        {/* Cover Photo Header */}
        {(() => {
          const coverImg = donation.coverImage || donation.bannerImage;
          return (
            <div className="relative w-full min-h-[220px] max-h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden">
              {coverImg ? (
                <>
                  {/* Blurred ambient backdrop */}
                  <img 
                    src={coverImg} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 select-none pointer-events-none" 
                  />
                  {/* Uncropped centered image */}
                  <img 
                    src={coverImg} 
                    alt={donation.title} 
                    className="relative z-10 max-h-[380px] w-auto max-w-full object-contain mx-auto shadow-md" 
                  />
                </>
              ) : (
                <div className="w-full h-56 flex items-center justify-center text-slate-300 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <Heart className="w-16 h-16 text-indigo-300" />
                </div>
              )}
            </div>
          );
        })()}

        <div className="px-6 sm:px-8 space-y-5 pt-2">
          {/* Category, Priority & Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <Tag size={12} /> {donation.category || 'General'}
            </span>
            {donation.priority && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Flame size={12} /> {donation.priority} Priority
              </span>
            )}
            {donation.status === 'Active' || donation.status === 'Published' ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Cause
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Closed Cause
              </span>
            )}
          </div>

          {/* Header Title & Created By */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{donation.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <User size={14} className="text-indigo-600" /> Created by: {createdByName}
              </span>
              {donation.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-rose-500" /> {donation.city}
                </span>
              )}
              {donation.visibility && (
                <span className="flex items-center gap-1">
                  <Globe size={14} className="text-blue-500" /> Visibility: {donation.visibility}
                </span>
              )}
              {donation.startDate && (
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-amber-500" /> Started: {new Date(donation.startDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Description & Details Section */}
          <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">About This Campaign</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {donation.description || donation.desc || 'No detailed description provided.'}
            </p>

            {/* Additional info pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {donation.minDonation > 1 && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                  Min Donation: ₹{donation.minDonation}
                </span>
              )}
              {donation.endDate && (
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                  Ends on: {new Date(donation.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Fundraising Progress Box */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raised Amount</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600">₹{raised.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Goal</span>
                <span className="text-xs sm:text-sm font-bold text-slate-600">₹{target.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-bold text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-indigo-600" /> {donation.donorCount || 0} Total Donors Contributed
              </span>
              <span className="text-indigo-600 font-extrabold">{percentage}% Funded</span>
            </div>

            {(donation.status === 'Active' || donation.status === 'Published') && (
              <button
                onClick={() => setIsDonateModalOpen(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Heart size={18} className="fill-white" /> Make a Donation Now
              </button>
            )}
          </div>

          {/* Donor History */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recent Donors & Supporters</h3>
            {(!donation.recentDonations || donation.recentDonations.length === 0) ? (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs text-slate-400">
                Be the first noble donor to contribute to this campaign!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                {donation.recentDonations.map((donor, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {donor.avatar ? (
                        <img src={donor.avatar} alt={donor.donorName} className="w-9 h-9 rounded-full object-cover shadow-sm border border-white" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-sm">
                          {donor.donorName ? donor.donorName[0].toUpperCase() : 'A'}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{donor.donorName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {new Date(donor.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-sm">+₹{(donor.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        donation={donation}
        onConfirmDonation={handleConfirmDonation}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DonationDetails;
