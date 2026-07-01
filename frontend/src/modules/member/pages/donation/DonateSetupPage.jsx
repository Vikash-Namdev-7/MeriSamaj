import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, GraduationCap, Heart, Users, Award, Smartphone, CreditCard, Landmark, ChevronDown } from 'lucide-react';
import { useDonation } from './DonationContext';
import { Badge } from '../../components/common/Badge';

const DonateSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { purposes } = useDonation();

  // Selected purpose (pre-filled if navigated from homepage or a specific dashboard card)
  const [selectedPurposeId, setSelectedPurposeId] = useState(() => {
    return location.state?.purposeId || purposes[0].id;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedAmountPreset, setSelectedAmountPreset] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [donationType, setDonationType] = useState('एक बार');
  const [paymentMethod, setPaymentMethod] = useState('UPI / Google Pay / PhonePe');

  const selectedPurpose = purposes.find(p => p.id === selectedPurposeId) || purposes[0];

  const getPurposeIcon = (id) => {
    switch (id) {
      case 'p1': return <Home size={18} className="text-amber-600" />;
      case 'p2': return <GraduationCap size={18} className="text-purple-600" />;
      case 'p3': return <Heart size={18} className="text-rose-500" fill="currentColor" />;
      case 'p4': return <Users size={18} className="text-emerald-600" />;
      default: return <Award size={18} className="text-blue-600" />;
    }
  };

  const amountPresets = [100, 500, 1000, 2100, 5100];

  const handleAmountSelect = (preset) => {
    setIsCustom(false);
    setSelectedAmountPreset(preset);
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setCustomAmount(val);
      setIsCustom(true);
      setSelectedAmountPreset(null);
    }
  };

  const finalAmount = isCustom ? Number(customAmount) : selectedAmountPreset;

  const handleProceed = () => {
    if (!finalAmount || finalAmount <= 0) return;

    navigate('/member/donation/payment', {
      state: {
        purposeId: selectedPurposeId,
        amount: finalAmount,
        type: donationType,
        method: paymentMethod
      }
    });
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/member/donation')} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">योगदान करें</h1>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-xl mx-auto space-y-6">
        
        {/* 1. Select Purpose (उद्देश्य चुनें) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">उद्देश्य चुनें</label>
          
          {/* Custom Dropdown */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-card border border-gray-200 rounded-2xl p-4 text-xs font-bold text-text-primary outline-none flex items-center justify-between transition-colors focus:border-purple-600 active:border-purple-600"
            >
              <span>{selectedPurpose.title}</span>
              <ChevronDown size={16} className={`text-text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop Click Handler */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                
                {/* Dropdown Options List */}
                <div className="absolute left-0 right-0 mt-1.5 bg-card border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto divide-y divide-gray-50/50">
                  {purposes.map(p => {
                    const isCurrent = p.id === selectedPurposeId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPurposeId(p.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${
                          isCurrent 
                            ? 'bg-purple-50 text-purple-950 font-extrabold' 
                            : 'text-text-primary hover:bg-gray-50'
                        }`}
                      >
                        {p.title}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Selected Purpose Details Card */}
          {selectedPurpose && (
            <div className="bg-card rounded-2xl p-4 border border-gray-100/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPurposeIcon(selectedPurpose.id)}
                  <span className="text-xs font-bold text-purple-900">{selectedPurpose.title}</span>
                </div>
                <Badge variant="warning" className="text-[9px] font-bold">
                  {selectedPurpose.percentage}%
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full" 
                  style={{ width: `${selectedPurpose.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Select Amount (योगदान राशि चुनें) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">योगदान राशि चुनें</label>
          
          <div className="grid grid-cols-3 gap-2.5">
            {amountPresets.map(preset => {
              const isSelected = selectedAmountPreset === preset && !isCustom;
              return (
                <button
                  key={preset}
                  onClick={() => handleAmountSelect(preset)}
                  className={`py-3.5 px-2 text-xs font-bold rounded-2xl border transition-all ${
                    isSelected 
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-extrabold shadow-sm' 
                      : 'border-gray-100 bg-card text-text-secondary hover:border-gray-200'
                  }`}
                >
                  ₹{preset}
                </button>
              );
            })}
            
            {/* Custom Amount Preset Button */}
            <button
              onClick={() => setIsCustom(true)}
              className={`py-3.5 px-2 text-xs font-bold rounded-2xl border transition-all ${
                isCustom 
                  ? 'border-purple-600 bg-purple-50 text-purple-950 font-extrabold shadow-sm' 
                  : 'border-gray-100 bg-card text-text-secondary'
              }`}
            >
              अन्य राशि
            </button>
          </div>

          {/* Custom Input Field */}
          {isCustom && (
            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₹</span>
              <input
                type="text"
                placeholder="राशि दर्ज करें"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full bg-card border border-purple-600 rounded-2xl py-3.5 pl-8 pr-4 text-xs font-bold text-text-primary outline-none"
              />
            </div>
          )}
        </div>

        {/* 3. Donation Type (योगदान का प्रकार) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">योगदान का प्रकार</label>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'एक बार', label: 'एक बार योगदान' },
              { type: 'नियमित', label: 'नियमित योगदान' }
            ].map(item => {
              const isSelected = donationType === item.type;
              return (
                <div
                  key={item.type}
                  onClick={() => setDonationType(item.type)}
                  className={`bg-card rounded-2xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected ? 'border-purple-600 bg-purple-50/20' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-purple-950' : 'text-text-primary'}`}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Payment Method (भुगतान विधि चुनें) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">भुगतान विधि चुनें</label>
          
          <div className="space-y-2.5">
            {[
              { id: 'upi', name: 'UPI / Google Pay / PhonePe', detail: 'तत्काल भुगतान', icon: Smartphone, iconColor: 'text-purple-600 bg-purple-50' },
              { id: 'card', name: 'डेबिट / क्रेडिट कार्ड', detail: 'वीजा, मास्टरकार्ड, रुपे', icon: CreditCard, iconColor: 'text-blue-600 bg-blue-50' },
              { id: 'netbank', name: 'नेट बैंकिंग', detail: 'सभी प्रमुख बैंक उपलब्ध', icon: Landmark, iconColor: 'text-amber-600 bg-amber-50' }
            ].map(method => {
              const isSelected = paymentMethod === method.name;
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`bg-card rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'border-purple-600 bg-purple-50/20' : 'border-gray-100 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${method.iconColor}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{method.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">{method.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proceed Action Button */}
        <button 
          onClick={handleProceed}
          disabled={!finalAmount || finalAmount <= 0}
          className={`w-full py-4 text-xs font-bold rounded-2xl press-scale shadow-md flex items-center justify-center gap-1 transition-colors ${
            (finalAmount && finalAmount > 0)
              ? 'bg-purple-700 hover:bg-purple-800 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          आगे बढ़ें
        </button>

      </div>
    </div>
  );
};

export default DonateSetupPage;
