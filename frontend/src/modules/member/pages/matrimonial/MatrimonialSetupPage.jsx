import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, Lock, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-[13.5px] font-bold text-slate-800 outline-none focus:border-rose-500 transition-all active:scale-[0.98] select-none"
      >
        <span>{selectedOption ? selectedOption.label : value}</span>
        <span className="text-[10px] text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full px-4 py-2.5 text-left text-[13.5px] font-semibold transition-all hover:bg-slate-50 ${
                opt.value === value ? 'text-rose-500 bg-rose-50/20' : 'text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MatrimonialSetupPage = ({ isHub = false, onPublish }) => {
  const navigate = useNavigate();
  const { addMatrimonialProfile, currentUser } = useData();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1: Photos & Privacy
    photoVisibility: 'connections',
    photoUrl: '',
    
    // Step 2: Basic Details
    height: "5'6\"",
    weight: '60 kg',
    bodyType: 'Average',
    complexion: 'Fair',
    bloodGroup: 'B+',
    maritalStatus: 'Never Married',
    motherTongue: 'Hindi',

    // Step 3: Religious & Social
    gotra: '',
    manglik: 'No',
    star: 'Unknown',
    rashi: 'Unknown',

    // Step 4: Education & Career
    education: '',
    college: '',
    profession: '',
    company: '',
    income: '',

    // Step 5: Family Details
    fatherStatus: '',
    motherStatus: '',
    brothers: '0',
    sisters: '0',
    familyType: 'Nuclear',
    familyValues: 'Moderate',
    familyAffluence: 'Upper Middle Class',

    // Step 6: Partner Preferences
    partnerAge: '24 - 29',
    partnerHeight: "5'2\" to 5'7\"",
    partnerEducation: 'Graduate or above',
    partnerProfession: 'Any',
    partnerLocation: 'Delhi NCR',
    partnerDiet: 'Vegetarian',
    partnerManglik: "Doesn't Matter",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      const profileData = {
        age: 26,
        height: form.height,
        weight: form.weight,
        bodyType: form.bodyType,
        complexion: form.complexion,
        bloodGroup: form.bloodGroup,
        maritalStatus: form.maritalStatus,
        motherTongue: form.motherTongue,
        profession: form.profession || 'Software Engineer',
        education: form.education || 'B.Tech',
        college: form.college || 'N/A',
        company: form.company || 'N/A',
        annualIncome: form.income || '10-12 LPA',
        gotra: form.gotra || 'N/A',
        manglik: form.manglik || 'No',
        star: form.star || 'Unknown',
        rashi: form.rashi || 'Unknown',
        photoVisibility: form.photoVisibility,
        familyType: form.familyType,
        familyValues: form.familyValues,
        familyAffluence: form.familyAffluence,
        fatherOccupation: form.fatherStatus || 'Business',
        motherOccupation: form.motherStatus || 'Homemaker',
        brothers: form.brothers,
        sisters: form.sisters,
        diet: 'Vegetarian',
        partnerPreferences: {
          ageRange: form.partnerAge,
          heightRange: form.partnerHeight,
          education: form.partnerEducation,
          profession: form.partnerProfession,
          location: form.partnerLocation,
          diet: form.partnerDiet,
          manglik: form.partnerManglik,
        }
      };

      if (onPublish) {
        onPublish(profileData);
      } else {
        addMatrimonialProfile(profileData);
        navigate('/member/matrimonial');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Photos & Privacy Settings</h2>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center border-2 border-dashed border-rose-200">
                  <Camera size={32} className="text-rose-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white text-[18px] font-bold shadow active:scale-90 cursor-pointer">
                  +
                </div>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 mb-4">
              <Lock size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-rose-650 leading-relaxed font-semibold">
                Control who can view your photo. Unconnected members will see a blurred version to ensure your maximum privacy.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Photo Visibility</label>
              <CustomSelect
                value={form.photoVisibility}
                onChange={(val) => setForm({ ...form, photoVisibility: val })}
                options={[
                  { value: 'all', label: 'Visible to all community members' },
                  { value: 'connections', label: 'Connections Only (Blurred for others)' },
                  { value: 'private', label: 'Hidden (Request approval to see)' }
                ]}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Basic Details</h2>
            <InputField label="Height" name="height" placeholder="e.g. 5'6&quot;" value={form.height} onChange={handleChange} />
            <InputField label="Weight" name="weight" placeholder="e.g. 62 kg" value={form.weight} onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Complexion</label>
                <CustomSelect value={form.complexion} onChange={(v) => setForm({...form, complexion: v})}
                  options={['Fair', 'Very Fair', 'Wheatish', 'Dark'].map(c => ({value: c, label: c}))}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Body Type</label>
                <CustomSelect value={form.bodyType} onChange={(v) => setForm({...form, bodyType: v})}
                  options={['Average', 'Slim', 'Athletic', 'Heavy'].map(b => ({value: b, label: b}))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Marital Status</label>
                <CustomSelect value={form.maritalStatus} onChange={(v) => setForm({...form, maritalStatus: v})}
                  options={['Never Married', 'Divorced', 'Widowed'].map(m => ({value: m, label: m}))}
                />
              </div>
              <InputField label="Mother Tongue" name="motherTongue" value={form.motherTongue} onChange={handleChange} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Religious & Social Details</h2>
            <InputField label="Gotra" name="gotra" placeholder="e.g. Bansal" value={form.gotra} onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Manglik Status</label>
                <CustomSelect value={form.manglik} onChange={(v) => setForm({...form, manglik: v})}
                  options={['No', 'Yes', "Don't Know"].map(m => ({value: m, label: m}))}
                />
              </div>
              <InputField label="Rashi" name="rashi" placeholder="e.g. Kanya" value={form.rashi} onChange={handleChange} />
            </div>
            <InputField label="Nakshatra / Star" name="star" placeholder="e.g. Chitra" value={form.star} onChange={handleChange} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Education & Career</h2>
            <InputField label="Highest Education" name="education" placeholder="e.g. B.Tech Computer Science" value={form.education} onChange={handleChange} />
            <InputField label="College / University" name="college" placeholder="e.g. Delhi University" value={form.college} onChange={handleChange} />
            <InputField label="Occupation / Profession" name="profession" placeholder="e.g. Senior Software Engineer" value={form.profession} onChange={handleChange} />
            <InputField label="Company Name" name="company" placeholder="e.g. Amazon India" value={form.company} onChange={handleChange} />
            <InputField label="Annual Income" name="income" placeholder="e.g. 15-20 LPA" value={form.income} onChange={handleChange} />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Family Background</h2>
            <InputField label="Father's Occupation" name="fatherStatus" placeholder="e.g. Retired Government Officer" value={form.fatherStatus} onChange={handleChange} />
            <InputField label="Mother's Occupation" name="motherStatus" placeholder="e.g. Homemaker" value={form.motherStatus} onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Brothers Count" name="brothers" placeholder="e.g. 1" value={form.brothers} onChange={handleChange} />
              <InputField label="Sisters Count" name="sisters" placeholder="e.g. 0" value={form.sisters} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Family Type</label>
                <CustomSelect value={form.familyType} onChange={(v) => setForm({...form, familyType: v})}
                  options={['Nuclear', 'Joint'].map(f => ({value: f, label: f}))}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Family Values</label>
                <CustomSelect value={form.familyValues} onChange={(v) => setForm({...form, familyValues: v})}
                  options={['Moderate', 'Traditional', 'Liberal'].map(f => ({value: f, label: f}))}
                />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-[16px] font-black text-slate-800">Partner Preferences</h2>
            <InputField label="Desired Age Range" name="partnerAge" placeholder="e.g. 24 - 29" value={form.partnerAge} onChange={handleChange} />
            <InputField label="Height Range" name="partnerHeight" placeholder="e.g. 5'2&quot; - 5'7&quot;" value={form.partnerHeight} onChange={handleChange} />
            <InputField label="Education Preference" name="partnerEducation" placeholder="e.g. Post Graduate" value={form.partnerEducation} onChange={handleChange} />
            <InputField label="Profession Preference" name="partnerProfession" placeholder="e.g. Doctor / Engineer" value={form.partnerProfession} onChange={handleChange} />

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 mt-4">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-[13px] font-extrabold text-emerald-800">All Set to Connect!</p>
                <p className="text-[11.5px] text-emerald-600 mt-0.5 leading-relaxed font-semibold">
                  Your detailed profile is ready to publish. It will show only matching parameters to others based on compatibility algorithms.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={isHub ? 'bg-slate-50 flex flex-col min-h-full pb-20' : 'min-h-screen bg-slate-50 flex flex-col pb-20'}>
      {/* Header */}
      {!isHub && (
        <div className="bg-white border-b border-slate-100 flex items-center gap-3 px-4 h-14 sticky top-0 z-30 shadow-sm">
          <button onClick={handleBack} className="p-1 active:opacity-60">
            <ArrowLeft size={22} className="text-slate-800" />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-black text-slate-800">Setup Profile</h1>
          </div>
          <span className="text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
            Step {step}/6
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full ${isHub ? 'px-4 pt-4' : ''}`}>
        <div className="bg-slate-200 w-full h-1">
          <div
            className="h-full bg-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Content Area */}
      <div className="flex-1 px-4 pt-5 pb-6 overflow-y-auto">
        {renderStep()}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-40 flex gap-3 shadow-md" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        {step > 1 && (
          <button
            onClick={handleBack}
            className="py-3.5 px-6 bg-slate-100 text-slate-600 rounded-2xl text-[13.5px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-rose-500 text-white rounded-2xl text-[13.5px] font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 active:scale-95 transition-all"
        >
          {step === 6 ? 'Publish Matrimonial Profile' : 'Continue'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type="text"
      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] font-bold text-slate-800 outline-none focus:border-rose-500 transition-all placeholder-slate-300"
      {...props}
    />
  </div>
);

export default MatrimonialSetupPage;
