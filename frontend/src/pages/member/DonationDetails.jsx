import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Calendar, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import memberDonationApi from '../../api/memberDonationApi';
import DonateModal from '../../components/member/DonateModal';

export const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      if (res.success) {
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
      const res = await memberDonationApi.handleDonationPayment(donationId, payload);
      if (res.success) {
        setIsDonateModalOpen(false);
        setSuccessToast(`Thank you! Your donation of ₹${payload.amount} was processed successfully.`);
        setTimeout(() => setSuccessToast(null), 5000);
        fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Payment simulation failed');
    } finally {
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

  const raised = donation.raisedAmount || 0;
  const target = donation.targetAmount || 1;
  const percentage = Math.min(100, Math.round((raised / target) * 100));

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
        <div className="relative h-64 sm:h-80 bg-slate-100">
          {donation.coverImage ? (
            <img src={donation.coverImage} alt={donation.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-indigo-50 to-purple-50">
              <Heart className="w-16 h-16 text-indigo-300" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/90 text-indigo-700 backdrop-blur-md shadow-md">
              {donation.category || 'General'}
            </span>
            {donation.status === 'Active' ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-md">
                Active Cause
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-700 text-white shadow-md">
                Closed Cause
              </span>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{donation.title}</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
              {donation.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Fundraising Progress Box */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Raised Amount</span>
                <span className="text-3xl font-black text-indigo-600">₹{raised.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Goal</span>
                <span className="text-lg font-bold text-slate-700">₹{target.toLocaleString()}</span>
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

            {donation.status === 'Active' && (
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
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-sm">
                        {donor.donorName ? donor.donorName[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{donor.donorName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} /> {new Date(donor.date).toLocaleDateString()}
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
