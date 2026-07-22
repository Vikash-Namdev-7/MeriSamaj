import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, Filter, Loader } from 'lucide-react';
import dharmashalaService from '../../../../core/api/dharmashalaService';
import { useData } from '../../context/DataProvider';

export default function DharmashalaHomePage() {
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dharamshalas, setDharamshalas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedFacilities, setSelectedFacilities] = useState({ ac: false, food: false });

  // Temporary states for modal before applying
  const [tempLocation, setTempLocation] = useState('all');
  const [tempFacilities, setTempFacilities] = useState({ ac: false, food: false });

  const fetchDharamshalas = async () => {
    setIsLoading(true);
    try {
      const res = await dharmashalaService.getDharmashalas({
        search: searchQuery,
        city: selectedLocation,
        ac: selectedFacilities.ac ? 'true' : 'false',
        food: selectedFacilities.food ? 'true' : 'false'
      });
      if (res.status === 'success') {
        setDharamshalas(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch dharmashalas", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDharamshalas();
  }, [searchQuery, selectedLocation, selectedFacilities]);

  const handleOpenFilter = () => {
    setTempLocation(selectedLocation);
    setTempFacilities({ ...selectedFacilities });
    setShowFilterModal(true);
  };

  const handleApplyFilter = () => {
    setSelectedLocation(tempLocation);
    setSelectedFacilities({ ...tempFacilities });
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setTempLocation('all');
    setTempFacilities({ ac: false, food: false });
  };

  const handleToggleLocation = (loc) => {
    setTempLocation(prev => prev === loc ? 'all' : loc);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 font-sans">
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-[17px] font-bold text-text-primary tracking-tight">धर्मशाला बुकिंग</h1>
        </div>
        <button 
          onClick={handleOpenFilter}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all press-scale ${selectedLocation !== 'all' || selectedFacilities.ac || selectedFacilities.food ? 'bg-purple-50 text-brand-primary border border-purple-200/40' : 'bg-gray-50 text-text-primary hover:bg-purple-50'}`}
        >
          <Filter size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="p-4 bg-white/40 backdrop-blur-md border-b border-purple-100/20 flex gap-3 items-center">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="धर्मशाला खोजें..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-purple-100/30 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] font-bold outline-none focus:border-brand-primary/45 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] transition-all text-slate-800"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
          </div>
          <button 
            onClick={() => navigate('/member/dharmashala/bookings')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-2xl font-bold text-[12.5px] shadow-sm shrink-0 transition-all press-scale"
          >
            मेरी बुकिंग्स
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : dharamshalas.length === 0 ? (
            <div className="card-neo p-8 text-center text-slate-500 font-bold">
              कोई धर्मशाला नहीं मिली
            </div>
          ) : (
            dharamshalas.map(d => (
              <div key={d._id} className="card-neo overflow-hidden flex flex-col">
                <div className="flex p-4 gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    <img 
                      src={d.image || (d.galleryImages && d.galleryImages[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500'} 
                      alt={d.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[15px] truncate">{d.name}</h3>
                    <div className="flex items-start gap-1 mt-1 text-slate-500">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-indigo-500" />
                      <span className="text-[11px] leading-tight font-medium">{d.address || d.location}{d.city ? `, ${d.city}` : ''}</span>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] font-bold text-slate-600">
                      <div className="flex items-center gap-1"><span>स्वामित्व:</span> <span className="text-slate-800">{d.community || 'Samaj Property'}</span></div>
                      <div className="flex items-center gap-1"><span>स्थिति:</span> <span className="text-emerald-600 font-extrabold">{d.status || 'Active'}</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-4 flex justify-end">
                  <button 
                    onClick={() => navigate(`/member/dharmashala/${d._id}`)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    बुकिंग करें
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      


      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-5 pb-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-black text-slate-800">फिल्टर करें</h3>
                <button onClick={handleResetFilter} className="text-[13px] font-bold text-indigo-650">रीसेट</button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-[13px] font-bold text-slate-600 mb-2">स्थान (Location)</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleToggleLocation('indore')}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${tempLocation === 'indore' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      इन्दौर
                    </button>
                    <button 
                      onClick={() => handleToggleLocation('ujjain')}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${tempLocation === 'ujjain' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      उज्जैन
                    </button>
                    <button 
                      onClick={() => handleToggleLocation('bhopal')}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${tempLocation === 'bhopal' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      भोपाल
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-600 mb-2">सुविधाएं (Facilities)</h4>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setTempFacilities(prev => ({ ...prev, ac: !prev.ac }))}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${tempFacilities.ac ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      AC कमरे
                    </button>
                    <button 
                      onClick={() => setTempFacilities(prev => ({ ...prev, food: !prev.food }))}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-colors ${tempFacilities.food ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'}`}
                    >
                      भोजन व्यवस्था
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 text-[14px] font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                रद्द करें
              </button>
              <button 
                onClick={handleApplyFilter}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                लागू करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
