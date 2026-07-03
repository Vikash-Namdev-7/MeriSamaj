import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Phone, MessageCircle, CheckCircle, ChevronDown, Check, MapPin } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { Avatar } from '../../components/common/Avatar';
import { PageHeader } from '../../components/layout/PageHeader';

// Translators for display mapping
const cityMap = {
  'Indore': 'Indore',
  'Jaipur': 'Jaipur',
  'Bhopal': 'Bhopal',
  'Ujjain': 'Ujjain',
  'Ahmedabad': 'Ahmedabad',
  'Lucknow': 'Lucknow',
  'Delhi': 'Delhi',
  'Kota': 'Kota',
  'Alwar': 'Alwar',
  'Bikaner': 'Bikaner',
  'Udaipur': 'Udaipur',
  'Pune': 'Pune',
};

const professionMap = {
  'Architect': 'Architect',
  'Doctor': 'Doctor',
  'Software Engineer': 'Software Engineer',
  'Teacher': 'Teacher',
  'CA': 'CA',
  'Pharmacist': 'Pharmacist',
  'Lawyer': 'Lawyer',
  'Interior Designer': 'Interior Designer',
  'Marketing Manager': 'Marketing Manager',
  'Homemaker': 'Homemaker',
  'Business Owner': 'Business Owner',
};

const designationMap = {
  'Patron': 'Patron',
  'President': 'President',
  'Vice President': 'Vice President',
  'Secretary': 'Secretary',
  'Joint Secretary': 'Joint Secretary',
  'Treasurer': 'Treasurer',
  'Zonal Head': 'Zonal Head',
  'Area Sub-Head': 'Area Sub-Head',
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
    return 'All Cities';
  });

  const [selectedProfession, setSelectedProfession] = useState(() => {
    if (filterType === 'profession' && filterVal && filterVal !== 'all') {
      const isCat = ['Executive Members', 'Business Owners', 'Teachers', 'Doctors', 'Engineers'].includes(filterVal);
      if (!isCat) {
        return professionMap[filterVal] || filterVal;
      }
    }
    return 'All Professions';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (filterType === 'profession' && filterVal) {
      const isCat = ['Executive Members', 'Business Owners', 'Teachers', 'Doctors', 'Engineers'].includes(filterVal);
      if (isCat) {
        return filterVal;
      }
    }
    return 'All Categories';
  });

  const [selectedBusinessType, setSelectedBusinessType] = useState('All');

  // Filter Checkbox states
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyBusiness, setOnlyBusiness] = useState(false);
  const [onlyOnline, setOnlyOnline] = useState(false);

  // Selector dropdown visibility toggles
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Dropdown lists matching categories
  const cities = ['All Cities', 'Indore', 'Jaipur', 'Bhopal', 'Ujjain', 'Kota', 'Alwar', 'Bikaner', 'Udaipur', 'Delhi'];
  const professions = ['All Professions', 'Architect', 'Doctor', 'Software Engineer', 'Teacher', 'CA', 'Pharmacist', 'Lawyer', 'Business Owner', 'Interior Designer', 'Homemaker'];
  const categories = ['All Categories', 'Executive Members', 'Business Owners', 'Teachers', 'Doctors', 'Engineers'];
  const businessTypes = ['All', 'Manufacturing', 'Construction', 'Education', 'Healthcare', 'Service', 'Other'];

  // Merge Admins & Members to have a unified database list matching Mockup Screen 2 (e.g. Suresh Sharma - Adhyaksh)
  const getMergedList = () => {
    // Generate simulated detailed data to map directly with Mockup Rajesh Sharma, etc.
    const baseList = [
      ...admins.map(adm => ({
        id: adm.id,
        name: adm.name,
        role: designationMap[adm.role] || adm.role || 'Executive Member',
        city: adm.city,
        phone: adm.phone || '+91 98765 43210',
        isVerified: true,
        initials: adm.initials,
        isOnline: true,
        age: 48,
        profession: 'Business Owner',
        businessType: 'Manufacturing'
      })),
      ...members.map(mem => ({
        id: mem.id,
        name: mem.name,
        role: professionMap[mem.profession] || mem.profession || 'Member',
        city: mem.city,
        phone: mem.phone || '+91 94250 12345',
        isVerified: mem.isVerified,
        initials: mem.initials,
        isOnline: Math.random() > 0.5,
        age: mem.age,
        profession: mem.profession,
        businessType: mem.profession === 'Architect' ? 'Construction' : mem.profession === 'Doctor' ? 'Healthcare' : mem.profession === 'Teacher' ? 'Education' : 'Other'
      }))
    ];

    // standard mockup names to make list feel authentic
    const mockReplacements = [
      { name: 'Rajesh Sharma', role: 'President', city: 'Jaipur', phone: '+91 98765 43210', isVerified: true },
      { name: 'Suresh Yadav', role: 'Business Owner', city: 'Kota', phone: '+91 98765 11111', isVerified: true },
      { name: 'Manish Gupta', role: 'Teacher', city: 'Alwar', phone: '+91 98765 22222', isVerified: true },
      { name: 'Ajay Singh', role: 'Software Engineer', city: 'Jaipur', phone: '+91 98765 33333', isVerified: true },
      { name: 'Vinod Kumar', role: 'Doctor', city: 'Bikaner', phone: '+91 98765 44444', isVerified: true },
      { name: 'Ravi Jain', role: 'Business Owner', city: 'Udaipur', phone: '+91 98765 55555', isVerified: true }
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
    if (selectedCity !== 'All Cities') {
      const mapped = cityMap[item.city] || item.city;
      if (mapped !== selectedCity) return false;
    }

    // 3. Profession Filter
    if (selectedProfession !== 'All Professions') {
      const mappedProf = professionMap[item.profession] || item.profession;
      if (mappedProf !== selectedProfession && item.role !== selectedProfession) return false;
    }

    // 4. Category Filter
    if (selectedCategory !== 'All Categories') {
      if (selectedCategory === 'Executive Members' && !['President', 'Secretary', 'Joint Secretary', 'Vice President', 'Treasurer', 'Patron'].includes(item.role)) return false;
      if (selectedCategory === 'Business Owners' && item.role !== 'Business Owner' && item.profession !== 'Business Owner') return false;
      if (selectedCategory === 'Teachers' && item.role !== 'Teacher' && item.profession !== 'Teacher') return false;
      if (selectedCategory === 'Doctors' && item.role !== 'Doctor' && item.profession !== 'Doctor') return false;
      if (selectedCategory === 'Engineers' && item.role !== 'Software Engineer' && item.profession !== 'Software Engineer') return false;
    }

    // 5. Business Type Filter
    if (selectedBusinessType !== 'All') {
      if (item.businessType !== selectedBusinessType) return false;
    }

    // 6. Checkboxes Filter
    if (onlyVerified && !item.isVerified) return false;
    if (onlyBusiness && item.role !== 'Business Owner' && item.profession !== 'Business Owner') return false;
    if (onlyOnline && !item.isOnline) return false;

    // 7. Quick age filters
    if (filterType === 'age') {
      if (filterVal === 'youth' && item.age >= 35) return false;
      if (filterVal === 'senior' && item.age < 60) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSelectedCity('All Cities');
    setSelectedProfession('All Professions');
    setSelectedCategory('All Categories');
    setSelectedBusinessType('All');
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
      <PageHeader title="All Members" subtitle="Community Directory" />

      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">
        {/* Search Bar & Filter Button */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3.5 gap-2.5 border border-purple-100/50 shadow-sm focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all duration-200">
            <Search size={18} className="text-text-secondary shrink-0" />
            <input 
              type="text" 
              placeholder="Search by name, mobile, profession, company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-primary flex-1 outline-none placeholder-text-secondary"
            />
          </div>
          <button 
            onClick={() => setShowFilters(true)}
            className={`p-3.5 rounded-2xl border flex items-center justify-center press-scale shadow-sm transition-all duration-200 ${
              showFilters || selectedCity !== 'All Cities' || selectedProfession !== 'All Professions' || selectedCategory !== 'All Categories' || selectedBusinessType !== 'All' || onlyVerified || onlyBusiness || onlyOnline
                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-purple-500/25' 
                : 'bg-white border-purple-100/50 text-text-primary hover:border-purple-200'
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Count Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Total Members: {filteredList.length}
          </span>
          {(selectedCity !== 'All Cities' || selectedProfession !== 'All Professions' || selectedCategory !== 'All Categories' || selectedBusinessType !== 'All' || onlyVerified || onlyBusiness || onlyOnline) && (
            <button 
              onClick={handleResetFilters} 
              className="text-xs font-extrabold text-brand-primary cursor-pointer hover:underline uppercase tracking-wider"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredList.length > 0 ? (
            filteredList.map((member) => (
              <div 
                key={member.id}
                onClick={() => navigate(`/member/directory/${member.id}`)}
                className="bg-white rounded-2xl p-4 border border-purple-100/20 flex items-center justify-between shadow-[0_4px_16px_rgba(109,40,217,0.02)] hover:border-purple-200/50 hover:shadow-[0_8px_24px_rgba(109,40,217,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar initials={member.initials} size="md" />
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-text-primary leading-tight group-hover:text-brand-primary transition-colors duration-200">{member.name}</span>
                      {member.isVerified && <CheckCircle size={14} className="text-emerald-500 fill-emerald-50 shrink-0" />}
                    </div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">{member.role}</p>
                    <p className="text-[9.5px] font-semibold text-text-muted mt-0.5 flex items-center gap-1">
                      <MapPin size={9} className="text-purple-300" /> {cityMap[member.city] || member.city}
                    </p>
                  </div>
                </div>

                {/* Quick actions (Chat only) */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => navigate(`/member/chat/${member.id}`)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-primary border border-purple-100/50 hover:bg-brand-primary hover:text-white transition-all duration-200 press-scale"
                    style={{ background: 'rgba(124,58,237,0.05)' }}
                  >
                    <MessageCircle size={13} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl py-12 px-4 text-center border border-dashed border-purple-200/50">
              <p className="text-xs text-text-secondary font-medium">No members found</p>
              <button 
                onClick={handleResetFilters}
                className="mt-2 text-xs font-bold text-brand-primary bg-purple-50 border border-purple-150/15 px-4 py-2 rounded-full press-scale"
              >
                View All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
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
                <h2 className="text-base font-bold text-text-primary">Filters</h2>
              </div>
              <button 
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 press-scale"
              >
                Reset
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-5 flex-1">
              {/* Filter 1: City Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">City</label>
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
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Profession</label>
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
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Category</label>
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
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Business Type</label>
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

              {/* Filter 5: Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Other Options</label>
                
                <div className="space-y-2.5">
                  {/* Option 1: Verified */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">Only Verified Members</span>
                  </label>

                  {/* Option 2: Business Owners */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyBusiness}
                      onChange={(e) => setOnlyBusiness(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">Only Business Owners</span>
                  </label>

                  {/* Option 3: Online Status */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={onlyOnline}
                      onChange={(e) => setOnlyOnline(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-text-primary">Online Members</span>
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
                Reset
              </button>
              <button 
                onClick={() => { setShowFilters(false); setActiveDropdown(null); }}
                className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-xs press-scale text-center hover:bg-indigo-700 shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryListPage;
