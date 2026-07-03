import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Upload,
  X,
  CheckCircle2,
  Globe,
  Lock,
  Phone,
  ChevronDown,
  CalendarDays,
  Clock,
  MapPin,
  RotateCcw,
  Crop,
  SlidersHorizontal,
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { AnimatedPage } from '../../components/layout/AnimatedPage';
import StepWizard from './components/StepWizard';

const CEREMONY_TYPES = [
  'Uthawna / Chautha',
  'Pagri Rasam',
  'Besna',
  'Terahvi',
  'Funeral / Last Rites',
  'Shradh'
];

const PREFIXES = ['Late', 'Late Shri', 'Late Smt', 'Shri', 'Smt', ''];

const INITIAL_FORM = {
  // Step 1 — Photo
  photoUrl: '',
  photoFile: null,
  // Step 2 — Basic Info
  prefix: 'Late Smt',
  deceasedName: '',
  age: '',
  birthDate: '',
  dateOfPassing: '',
  // Step 3 — Ceremony
  ritesType: 'Uthawna / Chautha',
  ritesDate: '',
  ritesTime: '',
  ritesVenue: '',
  showLocation: true,
  // Step 4 — Description & Privacy
  message: 'We request you all to pray for the peace of the departed soul.',
  privacy: 'public',
  familyContact: '',
  relation: 'Son/Daughter',
};

const CreateShradhanjaliPage = () => {
  const navigate = useNavigate();
  const { addObituary, currentUser } = useData();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const fileInputRef = useRef(null);
  const [showCeremonyPicker, setShowCeremonyPicker] = useState(false);

  useEffect(() => {
    if (showCeremonyPicker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCeremonyPicker]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  // ── Validation per step ──
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.photoUrl) newErrors.photoUrl = 'Please upload a photo';
    }
    if (step === 2) {
      if (!form.deceasedName.trim()) newErrors.deceasedName = 'Full name is required';
      if (!form.dateOfPassing) newErrors.dateOfPassing = 'Date of passing is required';
    }
    if (step === 3) {
      if (!form.ritesDate) newErrors.ritesDate = 'Ceremony date is required';
      if (!form.ritesVenue.trim()) newErrors.ritesVenue = 'Venue is required';
    }
    if (step === 4) {
      if (!form.message.trim()) newErrors.message = 'Message is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    if (step === 1) { navigate(-1); return; }
    setStep(s => Math.max(s - 1, 1));
  };

  // ── Photo upload handler ──
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, photoUrl: url, photoFile: file }));
    setErrors(e => ({ ...e, photoUrl: '' }));
  };

  // ── Final post submit ──
  const handlePost = async () => {
    if (isPosting) return;
    setIsPosting(true);
    await new Promise(r => setTimeout(r, 1200));

    const fullName = `${form.prefix} ${form.deceasedName}`.trim();
    const newOb = {
      id: `ob-${Date.now()}`,
      deceasedName: fullName,
      deceasedNameEn: form.deceasedName,
      age: parseInt(form.age) || 0,
      birthDate: form.birthDate,
      dateOfPassing: form.dateOfPassing,
      funeralDetails: {
        type: form.ritesType,
        date: form.ritesDate,
        time: form.ritesTime,
        venue: form.ritesVenue
      },
      message: form.message,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        initials: currentUser.initials,
        relation: form.relation
      },
      shraddhanjaliCount: 0,
      hasOfferedShraddhanjali: false,
      haathJodeCount: 0,
      malaArpanCount: 0,
      userHasHaathJode: false,
      userHasMalaArpan: false,
      views: 0,
      shares: 0,
      saves: 0,
      isSaved: false,
      privacy: form.privacy,
      familyContact: form.familyContact,
      timestamp: 'Just now',
      comments: [],
      image: form.photoUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    };

    addObituary(newOb);
    setIsPosting(false);
    setPosted(true);
    setTimeout(() => navigate('/member/shradhanjali', { replace: true }), 2000);
  };

  // ── Step content renderers ──

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-bold text-gray-900">Upload Photo</h2>
        <p className="text-[13px] text-gray-500">Use a large, clear, and high-quality photo</p>
      </div>

      {form.photoUrl ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-h-[320px]">
          <img src={form.photoUrl} alt="preview" className="w-full h-full object-cover" />
          {/* Overlay controls */}
          <div
            className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-around"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          >
            {[
              { icon: <Crop size={18} />, label: 'Crop' },
              { icon: <SlidersHorizontal size={18} />, label: 'Filter' },
              { icon: <RotateCcw size={18} />, label: 'Rotate' },
            ].map(({ icon, label }) => (
              <button key={label} className="flex flex-col items-center gap-1 text-white press-scale">
                {icon}
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
          {/* Remove */}
          <button
            onClick={() => setForm(f => ({ ...f, photoUrl: '', photoFile: null }))}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center press-scale"
          >
            <X size={14} />
          </button>
          {/* Om badge preview */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(20,12,0,0.75)', color: '#D4AF37' }}
          >
            🪔 Om Shanti
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-14 press-scale transition-all"
          style={{ borderColor: errors.photoUrl ? '#EF4444' : 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(124,92,46,0.1) 0%, rgba(212,175,55,0.15) 100%)' }}
          >
            <Upload size={28} style={{ color: '#7C5C2E' }} />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold" style={{ color: '#7C5C2E' }}>Upload Photo</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Please use a clear, appropriate photo</p>
          </div>
          <div
            className="px-4 py-2 rounded-full text-[13px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C5C2E 0%, #D4AF37 100%)' }}
          >
            Choose Photo
          </div>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {errors.photoUrl && (
        <p className="text-[12px] text-red-500 text-center">{errors.photoUrl}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-bold text-gray-900">Basic Information</h2>
        <p className="text-[13px] text-gray-500">Enter details of the deceased</p>
      </div>

      {/* Prefix selector */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Prefix</label>
        <div className="flex flex-wrap gap-2">
          {PREFIXES.map(p => (
            <button
              key={p || 'none'}
              onClick={() => set('prefix', p)}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all press-scale"
              style={{
                background: form.prefix === p ? '#7C5C2E' : 'white',
                color: form.prefix === p ? 'white' : '#374151',
                borderColor: form.prefix === p ? '#7C5C2E' : '#E5E7EB'
              }}
            >
              {p || 'None'}
            </button>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.deceasedName}
          onChange={e => set('deceasedName', e.target.value)}
          placeholder="e.g. Kamla Devi Agrawal"
          className="w-full rounded-xl px-4 py-3 text-[15px] border outline-none transition-all"
          style={{
            borderColor: errors.deceasedName ? '#EF4444' : form.deceasedName ? 'rgba(212,175,55,0.5)' : '#E5E7EB',
            background: '#FAFAF8'
          }}
        />
        {errors.deceasedName && <p className="text-[12px] text-red-500 mt-1">{errors.deceasedName}</p>}
        {/* Preview */}
        {form.deceasedName && (
          <p className="text-[12px] text-gray-400 mt-1">
            Preview: <span className="font-bold text-gray-700">{form.prefix} {form.deceasedName}</span>
          </p>
        )}
      </div>

      {/* Age + Relation */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={e => set('age', e.target.value)}
            placeholder="e.g. 82"
            className="w-full rounded-xl px-4 py-3 text-[15px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Relation</label>
          <input
            type="text"
            value={form.relation}
            onChange={e => set('relation', e.target.value)}
            placeholder="Son / Daughter"
            className="w-full rounded-xl px-4 py-3 text-[15px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>
      </div>

      {/* Birth + Death dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            <span className="flex items-center gap-1"><CalendarDays size={10} /> Date of Birth</span>
          </label>
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={form.birthDate}
            onChange={e => set('birthDate', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            <span className="flex items-center gap-1"><CalendarDays size={10} /> Date of Passing <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={form.dateOfPassing}
            onChange={e => set('dateOfPassing', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: errors.dateOfPassing ? '#EF4444' : '#E5E7EB' }}
          />
          {errors.dateOfPassing && <p className="text-[12px] text-red-500 mt-1">{errors.dateOfPassing}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-bold text-gray-900">Ceremony Details</h2>
        <p className="text-[13px] text-gray-500">Enter details of the last rites</p>
      </div>

      {/* Type selector — custom mobile bottom-sheet picker */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ceremony Type</label>
        <button
          type="button"
          onClick={() => setShowCeremonyPicker(true)}
          className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-[14px] border outline-none transition-all text-left press-scale"
          style={{ borderColor: 'rgba(212,175,55,0.4)', background: '#FAFAF8' }}
        >
          <span className="font-medium text-gray-900">{form.ritesType}</span>
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Ceremony type bottom-sheet picker */}
      {createPortal(
        <AnimatePresence>
          {showCeremonyPicker && (
            <motion.div
              key="ceremony-picker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', touchAction: 'none' }}
              onClick={() => setShowCeremonyPicker(false)}
              onWheel={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                className="w-full max-w-md rounded-t-[28px] overflow-hidden"
                style={{ background: 'white', touchAction: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Title */}
              <div
                className="flex items-center justify-between px-5 py-3 border-b"
                style={{ borderColor: 'rgba(212,175,55,0.15)' }}
              >
                <h3 className="text-[16px] font-bold" style={{ color: '#7C5C2E' }}>Select Ceremony Type</h3>
                <button
                  onClick={() => setShowCeremonyPicker(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center press-scale"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Options list */}
              <div className="py-2 pb-8">
                {CEREMONY_TYPES.map((type, idx) => {
                  const isSelected = form.ritesType === type;
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => { set('ritesType', type); setShowCeremonyPicker(false); }}
                      className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors press-scale"
                      style={{
                        background: isSelected ? 'rgba(212,175,55,0.08)' : 'transparent',
                        borderBottom: idx < CEREMONY_TYPES.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                      }}
                    >
                      <span
                        className="text-[15px] font-medium"
                        style={{ color: isSelected ? '#7C5C2E' : '#1A1A1A' }}
                      >
                        {type}
                      </span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[18px]"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            <span className="flex items-center gap-1"><CalendarDays size={10} /> Date <span className="text-red-400">*</span></span>
          </label>
          <input
            type="text"
            placeholder="YYYY-MM-DD"
            value={form.ritesDate}
            onChange={e => set('ritesDate', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: errors.ritesDate ? '#EF4444' : '#E5E7EB' }}
          />
          {errors.ritesDate && <p className="text-[12px] text-red-500 mt-1">{errors.ritesDate}</p>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            <span className="flex items-center gap-1"><Clock size={10} /> Time</span>
          </label>
          <input
            type="time"
            value={form.ritesTime}
            onChange={e => set('ritesTime', e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none bg-[#FAFAF8] transition-all"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          <span className="flex items-center gap-1"><MapPin size={10} /> Venue Address <span className="text-red-400">*</span></span>
        </label>
        <input
          type="text"
          value={form.ritesVenue}
          onChange={e => set('ritesVenue', e.target.value)}
          placeholder="e.g. Swarg Mandir, M.G. Road, Indore"
          className="w-full rounded-xl px-4 py-3 text-[15px] border outline-none bg-[#FAFAF8] transition-all"
          style={{ borderColor: errors.ritesVenue ? '#EF4444' : '#E5E7EB' }}
        />
        {errors.ritesVenue && <p className="text-[12px] text-red-500 mt-1">{errors.ritesVenue}</p>}
      </div>

      {/* Location toggle */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl border" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
        <div>
          <p className="text-[14px] font-semibold text-gray-800">Show Location</p>
          <p className="text-[11px] text-gray-500">Display location on map</p>
        </div>
        <button
          onClick={() => set('showLocation', !form.showLocation)}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 press-scale"
          style={{ background: form.showLocation ? '#7C5C2E' : '#D1D5DB' }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
            style={{ left: form.showLocation ? '26px' : '2px' }}
          />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-[18px] font-bold text-gray-900">Write Message</h2>
        <p className="text-[13px] text-gray-500">Condolence message & privacy settings</p>
      </div>

      {/* Tribute message */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          Condolence Message <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          rows={4}
          maxLength={300}
          placeholder="Write a message of remembrance..."
          className="w-full rounded-xl px-4 py-3 text-[14px] border outline-none bg-[#FAFAF8] resize-none transition-all"
          style={{ borderColor: errors.message ? '#EF4444' : form.message ? 'rgba(212,175,55,0.4)' : '#E5E7EB' }}
        />
        <div className="flex justify-between mt-1">
          {errors.message && <p className="text-[12px] text-red-500">{errors.message}</p>}
          <span className="text-[11px] text-gray-400 ml-auto">{form.message.length}/300</span>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Post Privacy</label>
        <div className="space-y-2">
          {[
            { value: 'public', label: 'Public', desc: 'All community members can view', icon: <Globe size={16} style={{ color: '#7C5C2E' }} /> },
            { value: 'private', label: 'Family Only', desc: 'Visible only to family members', icon: <Lock size={16} style={{ color: '#6B7280' }} /> },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => set('privacy', opt.value)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all press-scale"
              style={{
                borderColor: form.privacy === opt.value ? 'rgba(212,175,55,0.5)' : '#E5E7EB',
                background: form.privacy === opt.value ? 'rgba(212,175,55,0.06)' : 'white'
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">{opt.icon}</div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-900">{opt.label}</p>
                <p className="text-[11px] text-gray-400">{opt.desc}</p>
              </div>
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: form.privacy === opt.value ? '#7C5C2E' : '#D1D5DB' }}
              >
                {form.privacy === opt.value && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#7C5C2E' }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Family contact */}
      <div>
        <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          <span className="flex items-center gap-1"><Phone size={10} /> Family Contact Number</span>
        </label>
        <input
          type="tel"
          value={form.familyContact}
          onChange={e => set('familyContact', e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="9876543210"
          maxLength={10}
          className="w-full rounded-xl px-4 py-3 text-[15px] border outline-none bg-[#FAFAF8] transition-all"
          style={{ borderColor: '#E5E7EB' }}
        />
      </div>
    </div>
  );

  const renderReview = () => {
    const fullName = `${form.prefix} ${form.deceasedName}`.trim();
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-[18px] font-bold text-gray-900">Review Post</h2>
          <p className="text-[13px] text-gray-500">Check details before posting</p>
        </div>

        {/* Preview card */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: 'rgba(212,175,55,0.2)' }}
        >
          {/* Photo preview */}
          {form.photoUrl && (
            <div className="relative h-[200px]">
              <img src={form.photoUrl} alt="preview" className="w-full h-full object-cover" style={{ objectPosition: 'top center' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <div
                className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
                style={{ background: 'rgba(20,12,0,0.75)', color: '#D4AF37' }}
              >
                🪔 Om Shanti
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                <p className="text-white text-[18px] font-bold" style={{ fontFamily: 'Outfit, serif' }}>{fullName}</p>
                <p className="text-[12px]" style={{ color: 'rgba(212,175,55,0.9)' }}>
                  {form.age && `Age: ${form.age} Years`} {form.dateOfPassing && `• Passing: ${new Date(form.dateOfPassing).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 space-y-3" style={{ background: '#FFFBF5' }}>
            {/* Message */}
            {form.message && (
              <p className="text-[13px] text-gray-700 italic leading-relaxed">
                "{form.message}"
              </p>
            )}

            {/* Ceremony details */}
            {form.ritesDate && (
              <div
                className="rounded-xl p-3 border text-[12px] space-y-1"
                style={{ background: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.2)' }}
              >
                <p className="font-bold" style={{ color: '#7C5C2E' }}>{form.ritesType}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-gray-600">
                  {form.ritesDate && <span>📅 {form.ritesDate}</span>}
                  {form.ritesTime && <span>⏰ {form.ritesTime}</span>}
                  {form.ritesVenue && <span>📍 {form.ritesVenue}</span>}
                </div>
              </div>
            )}

            {/* Privacy & contact */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              {form.privacy === 'public' ? <Globe size={12} /> : <Lock size={12} />}
              <span>{form.privacy === 'public' ? 'Public' : 'Family Only'}</span>
              {form.familyContact && (
                <>
                  <span>•</span>
                  <Phone size={12} />
                  <span>{form.familyContact}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const STEP_CONTENT = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
  };

  // ── Posted Success Screen ──
  if (posted) {
    return (
      <AnimatedPage>
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-[72px]"
          >
            🪔
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Condolence Post Published</h2>
            <p className="text-[14px] text-gray-500">May their soul rest in peace 🙏</p>
          </motion.div>
        </div>
      </AnimatedPage>
    );
  }

  const isReview = step === 4 && form.deceasedName;

  return (
    <AnimatedPage>
      {/* ─── Header ─── */}
      <div
        className="responsive-fixed-top z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(212,175,55,0.15)',
          paddingTop: 'var(--spacing-safe-top)'
        }}
      >
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={handleBack} className="p-1.5 -ml-1 rounded-full press-scale text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-[15px] font-bold" style={{ color: '#7C5C2E' }}>Create Condolence Post</h1>
          </div>
          <span className="text-[12px] font-semibold text-gray-400">
            {step}/4
          </span>
        </div>

        {/* Step wizard */}
        <div className="px-4 pb-3">
          <StepWizard currentStep={step} />
        </div>
      </div>

      {/* ─── Form content ─── */}
      <div className="pt-[116px] pb-28 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Step content or review */}
            {step < 4
              ? STEP_CONTENT[step]?.()
              : (
                <div className="space-y-5">
                  {renderReview()}
                  {renderStep4()}
                </div>
              )
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Bottom CTA ─── */}
      <div
        className="responsive-fixed-bottom z-40 px-4 py-4 border-t"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(212,175,55,0.15)',
          paddingBottom: 'calc(var(--spacing-safe-bottom) + 16px)'
        }}
      >
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 press-scale"
            style={{
              background: 'linear-gradient(135deg, #7C5C2E 0%, #D4AF37 100%)',
              boxShadow: '0 4px 16px rgba(124,92,46,0.3)'
            }}
          >
            Proceed
            <ArrowRight size={18} />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 rounded-2xl font-bold text-[15px] border press-scale"
              style={{ borderColor: 'rgba(124,92,46,0.3)', color: '#7C5C2E' }}
            >
              Back
            </button>
            <button
              onClick={handlePost}
              disabled={isPosting}
              className="flex-2 flex-[2] py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 press-scale disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #7C5C2E 0%, #D4AF37 100%)',
                boxShadow: '0 4px 16px rgba(124,92,46,0.3)'
              }}
            >
              {isPosting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    🪔
                  </motion.span>
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Publish Post
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default CreateShradhanjaliPage;
