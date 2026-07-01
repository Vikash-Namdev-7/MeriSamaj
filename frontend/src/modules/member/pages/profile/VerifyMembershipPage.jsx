import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, UploadCloud, CheckCircle, Cpu } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const VerifyMembershipPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useData();
  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  const [fileAttached, setFileAttached] = useState(null);
  const [submitted, setSubmitted] = useState(currentUser.isVerificationSubmitted || false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttached(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docNumber || !fileAttached) return;

    // Save submission status
    updateProfile({
      isVerificationSubmitted: true,
      isVerified: false,
      verificationDocType: docType,
      verificationDocNumber: docNumber
    });
    setSubmitted(true);
  };

  const handleSimulateApprove = () => {
    // Instantly verify the user for testing
    updateProfile({
      isVerified: true,
      isVerificationSubmitted: false
    });
    navigate('/member/profile');
  };

  if (currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">You are Verified!</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-8 px-4">
          Your profile has been approved and authenticated by your community administration.
        </p>
        <button
          onClick={() => navigate('/member/profile')}
          className="w-full py-3.5 bg-brand-primary text-white rounded-xl text-sm font-semibold press-scale shadow-md"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between p-6 animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Request Submitted</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4 px-4 text-center">
            Your documents have been uploaded successfully. The community leadership of <strong>{currentUser.city}</strong> will review and verify your profile.
          </p>
          <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 w-full text-left space-y-2 mt-4">
            <p className="text-xs text-text-secondary"><strong>Verification Details:</strong></p>
            <p className="text-xs text-text-secondary">Document: {currentUser.verificationDocType || docType}</p>
            <p className="text-xs text-text-secondary">Number: {currentUser.verificationDocNumber || docNumber}</p>
          </div>
        </div>

        {/* Developer simulation panel */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-center">
            <Cpu size={24} className="text-indigo-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-900">Developer Testing Utility</p>
              <p className="text-[11px] text-indigo-700">Simulate administrative approval to test the verified member state.</p>
            </div>
          </div>
          <button
            onClick={handleSimulateApprove}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl press-scale shadow-md"
          >
            Approve Verification Instantly
          </button>
          <button
            onClick={() => navigate('/member/profile')}
            className="w-full py-3.5 bg-gray-100 text-text-secondary rounded-xl text-xs font-semibold press-scale text-center"
          >
            Go Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6 animate-fade-in">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 flex items-center gap-3 px-4 h-14 sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <h1 className="text-base font-bold text-text-primary tracking-tight">Request Verification</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 max-w-md mx-auto w-full">
        <div className="bg-emerald-50/50 rounded-2xl p-4 flex gap-3 mb-6 border border-emerald-100/60 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck size={20} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 mb-1">Verify Your Profile</h3>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Verified members receive a trust badge, can vote in community polls, apply for professional listing, and participate in matrimonial services.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select ID Document</label>
            <div className="relative mt-2">
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-white border border-purple-100/30 rounded-xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-brand-primary/45 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all appearance-none font-semibold shadow-sm"
              >
                <option>Aadhaar Card</option>
                <option>PAN Card</option>
                <option>Voter ID</option>
                <option>Passport</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary text-[10px] font-bold">▼</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">{docType} Number</label>
            <input 
              required
              type="text" 
              placeholder={`Enter your ${docType} number`}
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full mt-2 bg-white border border-purple-100/30 rounded-xl px-4 py-3.5 text-sm text-text-primary outline-none focus:border-brand-primary/45 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all placeholder-gray-450 font-medium shadow-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Upload Document Image</label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-200/50 rounded-2xl p-6 bg-white cursor-pointer hover:border-brand-primary transition-all shadow-sm">
                <UploadCloud size={32} className="text-purple-400 mb-2 animate-bounce" />
                <p className="text-xs text-text-primary font-bold">
                  {fileAttached ? fileAttached : "Select file or capture image"}
                </p>
                <p className="text-[10px] text-text-secondary mt-1 font-medium">Supports PNG, JPG (Max 5MB)</p>
                <input 
                  required
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-glow text-white rounded-xl text-sm font-semibold press-scale shadow-md shadow-purple-500/25 flex justify-center items-center gap-2"
            >
              <FileText size={16} /> Submit Documents
            </button>
            <p className="text-[10px] text-center text-text-muted mt-3 font-semibold">
              Your details are securely encrypted and reviewed only by verified community officials.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyMembershipPage;
