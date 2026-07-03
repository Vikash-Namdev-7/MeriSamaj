import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, FileText, CheckCircle, ChevronDown, Check, Trash2, Image, Video, Plus } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { PageHeader } from '../../components/layout/PageHeader';

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
      <PageHeader title="List Your Business" subtitle="Grow your reach" />

      <div className="flex-1 overflow-y-auto px-5 pt-6 max-w-md mx-auto w-full">
        {/* Grow your reach info card */}
        <div className="bg-[#7C3AED]/5 rounded-[24px] p-4.5 flex gap-3.5 mb-6 border border-purple-100/50 shadow-[0_4px_16px_rgba(109,40,217,0.01)]">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-purple-500/10">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-purple-900 mb-1 tracking-tight">Grow your reach</h3>
            <p className="text-[11.5px] text-purple-700 leading-relaxed font-medium">
              Join the community's professional directory to offer your services. Verified listings build trust and attract local business.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">Category</label>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between premium-input text-left"
            >
              <span className={selectedCategory ? "text-text-primary font-bold" : "text-text-secondary font-semibold"}>
                {selectedCategory || 'Select Category'}
              </span>
              <ChevronDown size={16} className={`text-text-secondary transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute top-[72px] left-0 right-0 bg-white border border-purple-100/20 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-purple-50/30 text-xs font-bold text-text-primary flex items-center justify-between transition-colors"
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
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">Profession / Title</label>
            <input 
              required 
              type="text" 
              value={profession} 
              onChange={(e) => setProfession(e.target.value)} 
              placeholder="e.g. Chartered Accountant" 
              className="w-full premium-input font-semibold" 
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">Company / Business Name</label>
            <input 
              required 
              type="text" 
              value={companyName} 
              onChange={(e) => setCompanyName(e.target.value)} 
              placeholder="e.g. Agrawal & Associates" 
              className="w-full premium-input font-semibold" 
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">Years of Experience</label>
            <input 
              required 
              type="number" 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
              placeholder="e.g. 5" 
              className="w-full premium-input font-semibold" 
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">Work Address / City</label>
            <input 
              required 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="e.g. MG Road, Indore" 
              className="w-full premium-input font-semibold" 
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block mb-1.5 px-0.5">About Your Service</label>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Briefly describe what you do..." 
              className="w-full h-24 premium-input font-semibold resize-none" 
            />
          </div>

          {/* New Media Upload Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest block px-0.5">Photos & Videos</label>
            
            {/* Horizontal preview list */}
            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple-100 shrink-0 group">
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 transition-all"
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

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-200/50 rounded-2xl p-6 bg-white cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-center group shadow-sm">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-2 shadow-sm border border-slate-100 group-hover:bg-brand-primary/10 transition-colors">
                <Plus size={20} className="text-slate-500 group-hover:text-brand-primary transition-colors" />
              </div>
              <span className="text-xs font-bold text-text-primary">Add Images or Videos</span>
              <span className="text-[10px] text-text-muted mt-0.5">Upload product photos, work videos, or certificates</span>
            </label>
          </div>

          <div className="pt-4 pb-12">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-600 hover:to-brand-primary text-white rounded-xl text-sm font-bold uppercase tracking-wider press-scale shadow-[0_4px_16px_rgba(124,58,237,0.25)] flex justify-center items-center gap-2 transition-all duration-300"
            >
              <FileText size={16} /> Submit Application
            </button>
            <p className="text-[10px] font-bold text-center text-text-muted mt-3 uppercase tracking-wider">
              By submitting, you agree to the community verification process.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyProfessionalPage;
