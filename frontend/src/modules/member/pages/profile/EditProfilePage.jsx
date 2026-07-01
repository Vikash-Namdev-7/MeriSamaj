import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { Avatar } from '../../components/common/Avatar';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useData();
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    gender: currentUser.gender || 'Male',
    dob: currentUser.dob || '1995-08-15',
    profession: currentUser.profession || '',
    company: currentUser.company || 'Agrawal Enterprises',
    address: currentUser.city || ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    // Basic validation
    if (!formData.name || !formData.phone) return;
    
    // update the central store
    updateProfile(formData);
    
    // Navigate back to profile
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-base font-semibold text-text-primary">Edit Profile</h1>
        </div>
        <button onClick={handleSave} className="text-brand-primary text-sm font-semibold flex items-center gap-1 press-scale">
          <Check size={16} /> Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-20">
        {/* Photo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar initials={currentUser.initials} src={currentUser.avatar} size="xl" color="bg-brand-primary/10 text-brand-primary border-2 border-brand-primary/20 text-3xl" />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-md press-scale border-2 border-white cursor-pointer">
              <Camera size={14} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      updateProfile({ avatar: event.target.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-brand-primary transition-all"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
          </div>

          <InputField label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} disabled />
          
          <InputField label="Email Address" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
          
          <InputField label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
          
          <InputField label="Company / Business Name" name="company" value={formData.company} onChange={handleChange} />
          
          <InputField label="City / Address" name="address" value={formData.address} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, disabled, ...props }) => (
  <div>
    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</label>
    <input
      className={`w-full mt-1.5 bg-card border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder-gray-400 ${
        disabled ? 'opacity-60 bg-gray-50 cursor-not-allowed' : 'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10'
      }`}
      disabled={disabled}
      {...props}
    />
  </div>
);

export default EditProfilePage;
