import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, FileText, CheckCircle, ChevronDown, Check } from 'lucide-react';

const ApplyProfessionalPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categories = ['Finance', 'Healthcare', 'IT/Tech', 'Legal', 'Real Estate', 'Business / Trade'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
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
          Your professional listing request has been sent for verification. Our community admins will review it shortly.
        </p>
        <button
          onClick={() => navigate('/member/professional')}
          className="w-full py-3.5 bg-brand-primary text-white rounded-xl text-sm font-semibold press-scale shadow-md"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center gap-3 px-4 h-14 sticky top-0 z-30">
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
                    <span className={selectedCategory === cat ? 'text-indigo-600' : ''}>{cat}</span>
                    {selectedCategory === cat && <Check size={14} className="text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" required value={selectedCategory} />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Profession / Title</label>
            <input required type="text" placeholder="e.g. Chartered Accountant" className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Company / Business Name</label>
            <input required type="text" placeholder="e.g. Agrawal & Associates" className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Years of Experience</label>
            <input required type="number" placeholder="e.g. 5" className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Work Address / City</label>
            <input required type="text" placeholder="e.g. MG Road, Indore" className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all" />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">About Your Service</label>
            <textarea required placeholder="Briefly describe what you do..." className="w-full h-24 mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all resize-none" />
          </div>

          <div className="pt-4 pb-12">
            <button type="submit" className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-sm font-semibold press-scale shadow-md flex justify-center items-center gap-2">
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
