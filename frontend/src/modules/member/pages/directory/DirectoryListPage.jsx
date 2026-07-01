import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Phone, MessageCircle, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { Avatar } from '../../components/common/Avatar';

// Hindi Translators for display mapping
const cityMap = {
  'Indore': 'इंदौर',
  'Jaipur': 'जयपुर',
  'Bhopal': 'भोपाल',
  'Ujjain': 'उज्जैन',
  'Ahmedabad': 'अहमदाबाद',
  'Lucknow': 'लखनऊ',
  'Delhi': 'दिल्ली',
  'Kota': 'कोटा',
  'Alwar': 'अलवर',
  'Bikaner': 'बीकानेर',
  'Udaipur': 'उदयपुर',
  'Pune': 'पुणे',
};

const professionMap = {
  'Architect': 'आर्किटेक्ट',
  'Doctor': 'डॉक्टर',
  'Software Engineer': 'इंजीनियर',
  'Teacher': 'शिक्षक',
  'CA': 'सीए',
  'Pharmacist': 'फार्मासिस्ट',
  'Lawyer': 'वकील',
  'Interior Designer': 'इंटीरियर डिजाइनर',
  'Marketing Manager': 'मार्केटिंग मैनेजर',
  'Homemaker': 'गृहणी',
  'Business Owner': 'व्यवसायी',
};

const designationMap = {
  'Patron': 'संरक्षक',
  'President': 'अध्यक्ष',
  'Vice President': 'उपाध्यक्ष',
  'Secretary': 'सचिव',
  'Joint Secretary': 'सह सचिव',
  'Treasurer': 'कोषाध्यक्ष',
  'Zonal Head': 'क्षेत्रीय प्रभारी',
  'Area Sub-Head': 'क्षेत्र प्रभारी',
};

const DirectoryListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { members, admins } = useData();

  // Route states from quick filters
  const stateData = location.state || {};
  const initialSearch = stateData.initialSearch || '';
  const filterType = stateData.filterType || '';
  const filterVal = stateData.filterVal || '';

  // Local Search & Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(stateData.openFilters || false);

  // Filter Drawer selectors state initialized inline deterministically from navigation state
  const [selectedCity, setSelectedCity] = useState(() => {
    if (filterType === 'city' && filterVal) {
      return cityMap[filterVal] || filterVal;
    }
    return 'सभी शहर';
  });

  const [selectedProfession, setSelectedProfession] = useState(() => {
    if (filterType === 'profession' && filterVal && filterVal !== 'all') {
      const isCat = ['कार्यकारी सदस्य', 'व्यवसायी', 'शिक्षक', 'डॉक्टर', 'इंजीनियर'].includes(filterVal);
      if (!isCat) {
        return professionMap[filterVal] || filterVal;
      }
    }
    return 'सभी पेशा';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (filterType === 'profession' && filterVal) {
      const isCat = ['कार्यकारी सदस्य', 'व्यवसायी', 'शिक्षक', 'डॉक्टर', 'इंजीनियर'].includes(filterVal);
      if (isCat) {
        return filterVal;
      }
    }
    return 'सभी श्रेणी';
  });

  const [selectedBusinessType, setSelectedBusinessType] = useState('सभी');

  // Filter Checkbox states
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyBusiness, setOnlyBusiness] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);

  // Selector dropdown visibility toggles
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Dropdown lists matching mockup categories
  const cities = ['सभी शहर', 'इंदौर', 'जयपुर', 'भोपाल', 'उज्जैन', 'कोटा', 'अलवर', 'बीकानेर', 'उदयपुर', 'दिल्ली'];
  const professions = ['सभी पेशा', 'आर्किटेक्ट', 'डॉक्टर', 'इंजीनियर', 'शिक्षक', 'सीए', 'फार्मासििस्ट', 'वकील', 'व्यवसायी', 'इंटीरियर डिजाइनर', 'गृहणी'];
  const categories = ['सभी श्रेणी', 'कार्यकारी सदस्य', 'व्यवसायी', 'शिक्षक', 'डॉक्टर', 'इंजीनियर'];
  const businessTypes = ['सभी', 'विनिर्माण', 'कंस्ट्रक्शन', 'शिक्षा', 'स्वास्थ्य', 'सेवा', 'अन्य'];

  // Merge Admins & Members to have a unified database list matching Mockup Screen 2 (e.g. Suresh Sharma - Adhyaksh)
  const getMergedList = () => {
    // Generate simulated detailed data to map directly with Mockup Rajesh Sharma, etc.
    const baseList = [
      ...admins.map(adm => ({
        id: adm.id,
        name: adm.name,
        role: designationMap[adm.role] || adm.role || 'कार्यकारी सदस्य',
        city: adm.city,
        phone: adm.phone || '+91 98765 43210',
        isVerified: true,
        initials: adm.initials,
        isOnline: true,
        age: 48,
        profession: 'व्यवसायी',
        businessType: 'विनिर्माण'
      })),
      ...members.map(mem => ({
        id: mem.id,
        name: mem.name,
        role: professionMap[mem.profession] || mem.profession || 'सदस्य',
        city: mem.city,
        phone: mem.phone || '+91 94250 12345',
        isVerified: mem.isVerified,
        initials: mem.initials,
        isOnline: Math.random() > 0.5,
        age: mem.age,
        profession: mem.profession,
        businessType: mem.profession === 'Architect' ? 'कंस्ट्रक्शन' : mem.profession === 'Doctor' ? 'स्वास्थ्य' : mem.profession === 'Teacher' ? 'शिक्षा' : 'अन्य'
      }))
    ];

    // Check if we need to add standard mockup names to make list feel authentic
    // e.g. "राजेश शर्मा", "सुरेश यादव", "मनीष गुप्ता", "अजय सिंह", "विनोद कुमार", "रवि जैन"
    const mockReplacements = [
      { name: 'राजेश शर्मा', role: 'अध्यक्ष', city: 'Jaipur', phone: '+91 98765 43210', isVerified: true },
      { name: 'सुरेश यादव', role: 'व्यवसायी', city: 'Kota', phone: '+91 98765 11111', isVerified: true },
      { name: 'मनीष गुप्ता', role: 'शिक्षक', city: 'Alwar', phone: '+91 98765 22222', isVerified: true },
      { name: 'अजय सिंह', role: 'इंजीनियर', city: 'Jaipur', phone: '+91 98765 33333', isVerified: true },
      { name: 'विनोद कुमार', role: 'डॉक्टर', city: 'Bikaner', phone: '+91 98765 44444', isVerified: true },
      { name: 'रवि जैन', role: 'व्यवसायी', city: 'Udaipur', phone: '+91 98765 55555', isVerified: true }
    ];

    // Map list to match mockup details
    return baseList.map((item, idx) => {
      const mockData = mockReplacements[idx % mockReplacements.length];
      return {
        ...item,
        name: mockData.name,
        role: mockData.role,
        city: mockData.city,
        phone: mockData.phone,
        isVerified: mockData.isVerified,
        initials: mockData.name.split(' ').map(n => n[0]).join('')
      };
    });
  };

  const listData = getMergedList();

  // Search Filter logic
  const filteredList = listData.filter(item => {
    // 1. Text Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchRole = item.role.toLowerCase().includes(q);
      const matchCity = (cityMap[item.city] || item.city).toLowerCase().includes(q);
      const matchPhone = item.phone.replace(/[\s+-]/g, '').includes(q);
      if (!matchName && !matchRole && !matchCity && !matchPhone) return false;
    }

    // 2. City Filter
    if (selectedCity !== 'सभी शहर') {
      const mapped = cityMap[item.city] || item.city;
      if (mapped !== selectedCity) return false;
    }

    // 3. Profession Filter
    if (selectedProfession !== 'सभी पेशा') {
      const mappedProf = professionMap[item.profession] || item.profession;
      if (mappedProf !== selectedProfession && item.role !== selectedProfession) return false;
    }

    // 4. Category Filter
    if (selectedCategory !== 'सभी श्रेणी') {
      if (selectedCategory === 'कार्यकारी सदस्य' && !['अध्यक्ष', 'सचिव', 'सह सचिव', 'उपाध्यक्ष', 'कोषाध्यक्ष', 'संरक्षक'].includes(item.role)) return false;
      if (selectedCategory === 'व्यवसायी' && item.role !== 'व्यवसायी' && item.profession !== 'Business Owner') return false;
      if (selectedCategory === 'शिक्षक' && item.role !== 'शिक्षक' && item.profession !== 'Teacher') return false;
      if (selectedCategory === 'डॉक्टर' && item.role !== 'डॉक्टर' && item.profession !== 'Doctor') return false;
      if (selectedCategory === 'इंजीनियर' && item.role !== 'इंजीनियर' && item.profession !== 'Software Engineer') return false;
    }

    // 5. Business Type Filter
    if (selectedBusinessType !== 'सभी') {
      if (item.businessType !== selectedBusinessType) return false;
    }

    // 6. Checkboxes Filter
    if (onlyVerified && !item.isVerified) return false;
    if (onlyBusiness && item.role !== 'व्यवसायी' && item.profession !== 'Business Owner') return false;
    if (onlyOnline && !item.isOnline) return false;

    // 7. Quick age filters
    if (filterType === 'age') {
      if (filterVal === 'youth' && item.age >= 35) return false;
      if (filterVal === 'senior' && item.age < 60) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSelectedCity('सभी शहर');
    setSelectedProfession('सभी पेशा');
    setSelectedCategory('सभी श्रेणी');
    setSelectedBusinessType('सभी');
    setOnlyVerified(false);
    setOnlyBusiness(false);
    setOnlyOnline(false);
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-16 relative">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-bold text-text-primary">सभी सदस्य</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">
        {/* Search Bar & Filter Button */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-card rounded-2xl px-4 py-3.5 gap-2.5 border border-gray-150 shadow-sm focus-within:border-indigo-600 transition-colors">
            <Search size={18} className="text-text-secondary shrink-0" />
            <input 
              type="text" 
              placeholder="नाम, मोबाइल, पेशा, कंपनी से खोजें..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-primary flex-1 outline-none placeholder-text-secondary"
            />
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className={`p-3.5 rounded-2xl border flex items-center justify-center press-scale shadow-sm ${
              showFilters || selectedCity !== 'सभी शहर' || selectedProfession !== 'सभी पेशा' || selectedCategory !== 'सभी श्रेणी' || selectedBusinessType !== 'सभी' || onlyVerified || onlyBusiness || onlyOnline
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-card border-gray-150 text-text-primary'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">
            कुल सदस्य: {filteredList.length}
          </span>
          {(selectedCity !== 'सभी शहर' || selectedProfession !== 'सभी पेशा' || selectedCategory !== 'सभी श्रेणी' || selectedBusinessType !== 'सभी' || onlyVerified || onlyBusiness || onlyOnline) && (
            <button 
              onClick={handleResetFilters} 
              className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline"
            >
              फ़िल्टर साफ़ करें
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredList.length > 0 ? (
            filteredList.map((member) => (
              <div 
                key={member.id}
                onClick={() => navigate(`/member/directory/${member.id}`)}
                className="bg-card rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-sm hover:border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={member.initials} size="md" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-text-primary">{member.name}</span>
                      {member.isVerified && <CheckCircle size={14} className="text-emerald-500 fill-emerald-50" />}
                    </div>
                    <p className="text-[10px] font-semibold text-text-secondary mt-0.5">{member.role}</p>
                    <p className="text-[9px] font-medium text-text-secondary mt-0.5">{cityMap[member.city] || member.city}, राजस्थान</p>
                  </div>
                </div>

                {/* Quick actions (Call / Chat) */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <a 
                    href={`tel:${member.phone}`}
                    className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 press-scale"
                  >
                    <Phone size={14} />
                  </a>
                  <button 
                    onClick={() => navigate(`/member/chat/${member.id}`)}
                    className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 press-scale"
                  >
                    <MessageCircle size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-2xl py-12 px-4 text-center border border-dashed border-gray-200">
              <p className="text-xs text-text-secondary font-medium">कोई सदस्य नहीं मिला</p>
              <button 
                onClick={handleResetFilters}
                className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full press-scale"
              >
                सभी देखें
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Screen 4: Advanced Filter Drawer (फ़िल्टर) */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 transition-opacity">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => { setShowFilters(false); setActiveDropdown(null); }} />

          {/* Drawer Body */}
          <div className="relative bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl z-10 animate-slide-up pb-8">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setShowFilters(false); setActiveDropdown(null); }}
                  className="p-1 -ml-1 press-scale"
                >
                  <ArrowLeft size={22} className="text-text-primary" />
                </button>
                <h2 className="text-base font-bold text-text-primary">फ़िल्टर</h2>
              </div>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 press-scale"
              >
                रीसेट करें
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-5 flex-1">
              {/* Filter 1: City Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">शहर</label>
                <button 
                  onClick={() => toggleDropdown('city')}
                  className="w-full flex items-center justify-between bg-surface border border-gray-150 px-4 py-3 rounded-2xl text-xs font-semibold text-text-primary"
                >
                  <span>{selectedCity}</span>
                  <ChevronDown size={16} className={`text-text-secondary transition-transform ${activeDropdown === 'city' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'city' && (
                  <div className="absolute top-[68px] left-0 right-0 bg-card border border-gray-150 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto py-2">
                    {cities.map((city) => (
                      <button 
                        key={city}
                        onClick={() => { setSelectedCity(city); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-text-primary flex-1 flex items-center justify-between"
                      >
                        <span className={selectedCity === city ? 'text-indigo-600' : ''}>{city}</span>
                        {selectedCity === city && <Check size={14} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 2: Profession Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">पेशा</label>
                <button 
                  onClick={() => toggleDropdown('profession')}
                  className="w-full flex items-center justify-between bg-surface border border-gray-150 px-4 py-3 rounded-2xl text-xs font-semibold text-text-primary"
                >
                  <span>{selectedProfession}</span>
                  <ChevronDown size={16} className={`text-text-secondary transition-transform ${activeDropdown === 'profession' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'profession' && (
                  <div className="absolute top-[68px] left-0 right-0 bg-card border border-gray-150 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto py-2">
                    {professions.map((prof) => (
                      <button 
                        key={prof}
                        onClick={() => { setSelectedProfession(prof); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-text-primary flex-1 flex items-center justify-between"
                      >
                        <span className={selectedProfession === prof ? 'text-indigo-600' : ''}>{prof}</span>
                        {selectedProfession === prof && <Check size={14} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 3: Category Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">श्रेणी</label>
                <button 
                  onClick={() => toggleDropdown('category')}
                  className="w-full flex items-center justify-between bg-surface border border-gray-150 px-4 py-3 rounded-2xl text-xs font-semibold text-text-primary"
                >
                  <span>{selectedCategory}</span>
                  <ChevronDown size={16} className={`text-text-secondary transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'category' && (
                  <div className="absolute top-[68px] left-0 right-0 bg-card border border-gray-150 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto py-2">
                    {categories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-text-primary flex-1 flex items-center justify-between"
                      >
                        <span className={selectedCategory === cat ? 'text-indigo-600' : ''}>{cat}</span>
                        {selectedCategory === cat && <Check size={14} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 4: Business Type Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">व्यवसाय प्रकार</label>
                <button 
                  onClick={() => toggleDropdown('businessType')}
                  className="w-full flex items-center justify-between bg-surface border border-gray-150 px-4 py-3 rounded-2xl text-xs font-semibold text-text-primary"
                >
                  <span>{selectedBusinessType}</span>
                  <ChevronDown size={16} className={`text-text-secondary transition-transform ${activeDropdown === 'businessType' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'businessType' && (
                  <div className="absolute top-[68px] left-0 right-0 bg-card border border-gray-150 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto py-2">
                    {businessTypes.map((type) => (
                      <button 
                        key={type}
                        onClick={() => { setSelectedBusinessType(type); setActiveDropdown(null); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-text-primary flex-1 flex items-center justify-between"
                      >
                        <span className={selectedBusinessType === type ? 'text-indigo-600' : ''}>{type}</span>
                        {selectedBusinessType === type && <Check size={14} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 5: Checkboxes (अन्य विकल्प) */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">अन्य विकल्प</label>
                
                <div className="space-y-2.5">
                  {/* Option 1: Verified */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">केवल सत्यापित सदस्य</span>
                  </label>

                  {/* Option 2: Business Owners */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyBusiness}
                      onChange={(e) => setOnlyBusiness(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">केवल व्यवसायी</span>
                  </label>

                  {/* Option 3: Online Status */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyOnline}
                      onChange={(e) => setOnlyOnline(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">ऑनलाइन सदस्य</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-4 pt-4 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleResetFilters}
                className="flex-1 py-3.5 border border-gray-200 text-text-primary rounded-2xl font-bold text-xs press-scale text-center hover:bg-gray-50"
              >
                रीसेट करें
              </button>
              <button 
                onClick={() => { setShowFilters(false); setActiveDropdown(null); }}
                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs press-scale text-center hover:bg-indigo-700 shadow-md"
              >
                खोजें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryListPage;
