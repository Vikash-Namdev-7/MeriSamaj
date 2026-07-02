import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, FileText, CheckCircle, ChevronDown, Check, Trash2, Image, Video, Plus } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const ApplyProfessionalPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useData();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Controlled fields state
  const [profession, setProfession] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // array of { type: 'image' | 'video', url: string }

  const categories = ['Finance', 'Healthcare', 'IT/Tech', 'Legal', 'Real Estate', 'Business / Trade'];

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaFiles(prev => [
          ...prev,
          {
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    const categoryKey = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const phone = currentUser?.phone || '+91 99999 88888';
    const initials = companyName.substring(0, 2).toUpperCase();

    // Create the business listing object
    const newBusiness = {
      id: `custom-p-${Date.now()}`,
      title: companyName,
      category: selectedCategory,
      categoryKey: categoryKey,
      city: address.split(',').pop().trim() || 'Indore',
      rating: 5.0,
      initials: initials,
      phone: phone,
      verified: true, // auto-verified for demo
      description: description,
      experience: experience,
      address: address,
      logo: mediaFiles.find(f => f.type === 'image')?.url || null,
      media: mediaFiles,
    };

    // Save to localStorage
    const localListingsRaw = localStorage.getItem('merisamaj_custom_professionals');
    const localListings = localListingsRaw ? JSON.parse(localListingsRaw) : [];
    localStorage.setItem('merisamaj_custom_professionals', JSON.stringify([newBusiness, ...localListings]));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Application Submitted!</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          Your professional listing request has been verified and published! You can view it now in the directory.
        </p>
        <button
          onClick={() => navigate('/member/professional')}
          className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-semibold press-scale shadow-md"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center gap-3 px-4 h-14 sticky top-0 z-30 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
          <ArrowLeft size={22} className="text-text-primary" />
        </button>
        <h1 className="text-base font-semibold text-text-primary">List Your Business</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6">
        <div className="bg-purple-50 rounded-2xl p-4 flex gap-3 mb-6 border border-purple-100">
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center shrink-0">
            <Briefcase size={20} className="text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-900 mb-1">Grow your reach</h3>
            <p className="text-xs text-purple-700 leading-relaxed">
              Join the community's professional directory to offer your services. Verified listings build trust and attract local business.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full mt-1.5 flex items-center justify-between bg-card border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-text-primary outline-none focus:border-brand-primary transition-all text-left"
            >
              <span className={selectedCategory ? "text-text-primary" : "text-text-secondary"}>
                {selectedCategory || 'Select Category'}
              </span>
              <ChevronDown size={16} className={`text-text-secondary transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute top-[68px] left-0 right-0 bg-card border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-text-primary flex items-center justify-between"
                  >
                    <span className={selectedCategory === cat ? 'text-[#7C3AED]' : ''}>{cat}</span>
                    {selectedCategory === cat && <Check size={14} className="text-[#7C3AED]" />}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" required value={selectedCategory} />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Profession / Title</label>
            <input 
              required 
              type="text" 
              value={profession} 
              onChange={(e) => setProfession(e.target.value)} 
              placeholder="e.g. Chartered Accountant" 
              className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Company / Business Name</label>
            <input 
              required 
              type="text" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              placeholder="e.g. Agrawal & Associates" 
              className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Years of Experience</label>
            <input 
              required 
              type="number" 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
              placeholder="e.g. 5" 
              className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Work Address / City</label>
            <input 
              required 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="e.g. MG Road, Indore" 
              className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">About Your Service</label>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Briefly describe what you do..." 
              className="w-full h-24 mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all resize-none" 
            />
          </div>

          {/* New Media Upload Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">Photos & Videos</label>
            
            {/* Horizontal preview list */}
            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 group">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 bg-black/75 hover:bg-red-600 text-white rounded-full p-1 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md rounded-md px-1 py-0.5 text-[8px] font-bold text-white uppercase flex items-center gap-0.5 pointer-events-none">
                      {media.type === 'video' ? <Video size={8} /> : <Image size={8} />}
                      {media.type}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-card cursor-pointer hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 transition-all text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 shadow-sm border border-slate-100 group-hover:bg-[#7C3AED]/10 transition-colors">
                <Plus size={20} className="text-slate-500" />
              </div>
              <span className="text-xs font-bold text-text-primary">Add Images or Videos</span>
              <span className="text-[10px] text-text-muted mt-0.5">Upload product photos, work videos, or certificates</span>
            </label>
          </div>

          <div className="pt-4 pb-12">
            <button type="submit" className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-semibold press-scale shadow-md flex justify-center items-center gap-2">
              <FileText size={16} /> Submit Application
            </button>
            <p className="text-xs text-center text-text-secondary mt-3">
              By submitting, you agree to the community verification process.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyProfessionalPage;
