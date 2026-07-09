import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { uploadCommunityImage } from '../services/brandingService';

export const BrandingTab = ({ settings, updateDraft }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Simulate API upload
      const res = await uploadCommunityImage('cm_123', type, file);
      if (res.success) {
        // Update draft with new fake CDN URL
        updateDraft('branding', type, res.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const renderUploadBox = (title, description, type, currentUrl) => (
    <div className="card-neo p-5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
      </div>

      <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center p-6 min-h-[140px]">
        {currentUrl ? (
          <img src={currentUrl} alt={title} className="max-h-full max-w-full object-contain absolute inset-0 m-auto p-2" />
        ) : (
          <div className="text-center space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto text-brand-primary">
              <ImageIcon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Drag or click</p>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileUpload(e, type)}
          disabled={uploading}
        />

        {currentUrl && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <UploadCloud size={14} /> Replace
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const branding = settings?.branding || {};

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-gray-900">Community Branding</h2>
        <p className="text-xs text-gray-500">Manage logos, banners and visual assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderUploadBox('Primary Logo', 'Used in header (Square 500x500 px)', 'logo', branding.logo)}
        {renderUploadBox('Dark Theme Logo', 'For dark backgrounds', 'darkLogo', branding.darkLogo)}
        {renderUploadBox('Mobile Logo', 'Icon only version', 'mobileLogo', branding.mobileLogo)}
        {renderUploadBox('Favicon', 'Browser tab icon (32x32 px)', 'favicon', branding.favicon)}
        
        <div className="xl:col-span-2">
          {renderUploadBox('Cover Banner', 'Used in community profile header (1200x400 px)', 'coverBanner', branding.coverBanner)}
        </div>
      </div>
    </div>
  );
};
