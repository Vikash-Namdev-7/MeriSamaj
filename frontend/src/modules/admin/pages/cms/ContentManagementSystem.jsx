import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Search, Download, Upload, AlertCircle, CheckCircle2, Plus, 
  Layers, Megaphone, HelpCircle, FileText, FolderOpen, Image, ShieldAlert,
  ArrowRight, ToggleLeft, ToggleRight, Trash2, Edit, Copy, Eye, Calendar,
  Pin, Clock, Server, Monitor, Tablet, Smartphone, History, CornerUpLeft, 
  Folder, Tag, Check, X, Mail, Phone, MapPin, ExternalLink, ArrowUp, ArrowDown,
  FileSpreadsheet, FileJson, ArrowUpDown
} from 'lucide-react';

// Import services
import { bannerService } from '../../services/bannerService';
import { faqService } from '../../services/faqService';
import { pageService } from '../../services/pageService';
import { mediaService } from '../../services/mediaService';
import { cmsService } from '../../services/cmsService';

export const ContentManagementSystem = () => {
  // Navigation Tabs
  const tabs = [
    { id: 'dashboard', name: 'Overview', icon: Globe },
    { id: 'banners', name: 'Banners & Sliders', icon: Layers },
    { id: 'pages', name: 'Page Builder', icon: FileText },
    { id: 'faqs', name: 'FAQ Directory', icon: HelpCircle },
    { id: 'media', name: 'Media Library', icon: FolderOpen },
    { id: 'settings', name: 'Footer & Contact', icon: ShieldAlert }
  ];
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Loading and State
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Data States
  const [banners, setBanners] = useState([]);
  const [pages, setPages] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [footerContent, setFooterContent] = useState({});

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  // Specific Sub-Module States
  const [selectedFaqCategory, setSelectedFaqCategory] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('about');
  const [pageEditorContent, setPageEditorContent] = useState('');
  const [pageEditorTitle, setPageEditorTitle] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, tablet, mobile
  const [pageSelectedVersion, setPageSelectedVersion] = useState(null);

  // Modal / Form States
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    type: 'hero', title: '', subtitle: '', description: '',
    ctaText: '', ctaLink: '', imageUrl: '', mobileImageUrl: '',
    startDate: '', endDate: '', status: 'Draft', priority: 5, targetAudience: 'All'
  });

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    categoryId: '', question: '', answer: '', status: 'Active'
  });

  // Media upload simulation state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', folder: 'Banners', tags: '' });
  const [activeMediaFolder, setActiveMediaFolder] = useState('All');

  // Trigger toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load Initial Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        loadedBanners,
        loadedPages,
        loadedCategories,
        loadedFaqs,
        loadedMedia,
        loadedFolders,
        loadedLogs,
        loadedContact,
        loadedFooter
      ] = await Promise.all([
        bannerService.getAllBanners(),
        pageService.getAllPages(),
        faqService.getCategories(),
        faqService.getFAQs(),
        mediaService.getMediaItems(),
        mediaService.getFolders(),
        cmsService.getAuditLogs(),
        cmsService.getContactInfo(),
        cmsService.getFooterContent()
      ]);

      setBanners(loadedBanners);
      setPages(loadedPages);
      setFaqCategories(loadedCategories);
      setFaqs(loadedFaqs);
      setMediaItems(loadedMedia);
      setFolders(loadedFolders);
      setAuditLogs(loadedLogs);
      setContactInfo(loadedContact);
      setFooterContent(loadedFooter);
      
      if (loadedCategories.length > 0) {
        setSelectedFaqCategory(loadedCategories[0].id);
      }

      // Initialize page editor with 'About Us'
      const aboutPage = loadedPages.find(p => p.id === 'about');
      if (aboutPage) {
        setPageEditorTitle(aboutPage.title);
        setPageEditorContent(aboutPage.content);
      }

    } catch (error) {
      showToast('Failed to load dashboard resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Fetch page detail on page switch
  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setPageEditorTitle(page.title);
      setPageEditorContent(page.content);
      setPageSelectedVersion(null);
    }
  };

  // Handle Page Save
  const handleSavePage = async () => {
    try {
      const updated = await pageService.updatePage(selectedPageId, {
        title: pageEditorTitle,
        content: pageEditorContent
      });
      // Refresh pages list
      const allPages = await pageService.getAllPages();
      setPages(allPages);
      
      // Update Audit log
      cmsService.addAuditLog('Updated', 'Pages', selectedPageId, `Updated page "${pageEditorTitle}"`);
      const newLogs = await cmsService.getAuditLogs();
      setAuditLogs(newLogs);

      showToast(`Successfully saved page: "${pageEditorTitle}"!`);
    } catch (e) {
      showToast('Error updating page content', 'error');
    }
  };

  // Restore Version
  const handleRestoreVersion = async (versionId) => {
    try {
      const restored = await pageService.restoreVersion(selectedPageId, versionId);
      setPageEditorTitle(restored.title);
      setPageEditorContent(restored.content);
      setPageSelectedVersion(null);
      
      const allPages = await pageService.getAllPages();
      setPages(allPages);

      cmsService.addAuditLog('Restored', 'Pages', selectedPageId, `Restored version ${versionId} for page "${restored.title}"`);
      const newLogs = await cmsService.getAuditLogs();
      setAuditLogs(newLogs);

      showToast(`Restored page content to version #${versionId}`);
    } catch (e) {
      showToast('Failed to restore version', 'error');
    }
  };

  // Handle global search
  const handleGlobalSearch = async (val) => {
    setGlobalSearchQuery(val);
    if (!val) {
      setSearchResults(null);
      return;
    }
    const results = await cmsService.globalSearch(val);
    setSearchResults(results);
  };

  // Handle Exports
  const handleExport = async (format, moduleName) => {
    try {
      const result = await cmsService.exportData(format, moduleName);
      // Simulate file download trigger
      showToast(`Exported ${moduleName} in ${format} format! Dowloading ${result.filename}...`);
    } catch (e) {
      showToast('Export failed', 'error');
    }
  };

  // Banner CRUD
  const handleOpenBannerModal = (banner = null) => {
    if (banner) {
      setSelectedBanner(banner);
      setBannerForm({ ...banner });
    } else {
      setSelectedBanner(null);
      setBannerForm({
        type: 'hero', title: '', subtitle: '', description: '',
        ctaText: '', ctaLink: '', imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=60', mobileImageUrl: '',
        startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'Draft', priority: 5, targetAudience: 'All'
      });
    }
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      if (selectedBanner) {
        await bannerService.updateBanner(selectedBanner.id, bannerForm);
        cmsService.addAuditLog('Updated', 'Banners', selectedBanner.id, `Updated banner "${bannerForm.title}"`);
        showToast('Banner details updated');
      } else {
        const created = await bannerService.createBanner(bannerForm);
        cmsService.addAuditLog('Created', 'Banners', created.id, `Created banner "${bannerForm.title}"`);
        showToast('New banner created successfully');
      }
      setBannerModalOpen(false);
      const list = await bannerService.getAllBanners();
      setBanners(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      showToast('Failed to save banner', 'error');
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete banner: "${title}"?`)) {
      await bannerService.deleteBanner(id);
      cmsService.addAuditLog('Deleted', 'Banners', id, `Deleted banner "${title}"`);
      showToast('Banner deleted');
      const list = await bannerService.getAllBanners();
      setBanners(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);
    }
  };

  const handleDuplicateBanner = async (id, title) => {
    await bannerService.duplicateBanner(id);
    cmsService.addAuditLog('Created', 'Banners', id, `Duplicated banner "${title}"`);
    showToast('Banner duplicated');
    const list = await bannerService.getAllBanners();
    setBanners(list);
    const logs = await cmsService.getAuditLogs();
    setAuditLogs(logs);
  };

  const handleToggleBannerStatus = async (id, title) => {
    await bannerService.toggleBannerStatus(id);
    cmsService.addAuditLog('Updated', 'Banners', id, `Toggled status of banner "${title}"`);
    showToast('Banner status updated');
    const list = await bannerService.getAllBanners();
    setBanners(list);
    const logs = await cmsService.getAuditLogs();
    setAuditLogs(logs);
  };

  const handleMoveBannerOrder = async (id, direction) => {
    // Basic local swapping for displayOrder
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === banners.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newBanners = [...banners];
    
    // swap display orders
    const temp = newBanners[idx].displayOrder;
    newBanners[idx].displayOrder = newBanners[targetIdx].displayOrder;
    newBanners[targetIdx].displayOrder = temp;

    const orderedIds = newBanners.sort((a, b) => a.displayOrder - b.displayOrder).map(b => b.id);
    const updated = await bannerService.reorderBanners(orderedIds);
    setBanners(updated);
    showToast('Banner priority ordering updated');
  };

  // FAQ CRUD
  const handleOpenFaqModal = (faq = null) => {
    if (faq) {
      setSelectedFaq(faq);
      setFaqForm({ ...faq });
    } else {
      setSelectedFaq(null);
      setFaqForm({
        categoryId: selectedFaqCategory || (faqCategories[0]?.id || ''),
        question: '', answer: '', status: 'Active'
      });
    }
    setFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      if (selectedFaq) {
        await faqService.updateFAQ(selectedFaq.id, faqForm);
        cmsService.addAuditLog('Updated', 'FAQs', selectedFaq.id, `Updated FAQ: "${faqForm.question}"`);
        showToast('FAQ updated');
      } else {
        const created = await faqService.createFAQ(faqForm);
        cmsService.addAuditLog('Created', 'FAQs', created.id, `Created FAQ: "${faqForm.question}"`);
        showToast('New FAQ question added');
      }
      setFaqModalOpen(false);
      const list = await faqService.getFAQs();
      setFaqs(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      showToast('Failed to save FAQ', 'error');
    }
  };

  const handleDeleteFaq = async (id, question) => {
    if (window.confirm(`Delete FAQ: "${question}"?`)) {
      await faqService.deleteFAQ(id);
      cmsService.addAuditLog('Deleted', 'FAQs', id, `Deleted FAQ "${question}"`);
      showToast('FAQ deleted');
      const list = await faqService.getFAQs();
      setFaqs(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);
    }
  };

  const handleToggleFaqStatus = async (id, question, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await faqService.updateFAQ(id, { status: nextStatus });
    cmsService.addAuditLog('Updated', 'FAQs', id, `Set status of FAQ "${question}" to ${nextStatus}`);
    showToast(`FAQ is now ${nextStatus}`);
    const list = await faqService.getFAQs();
    setFaqs(list);
    const logs = await cmsService.getAuditLogs();
    setAuditLogs(logs);
  };

  const handleMoveFaqOrder = async (id, direction) => {
    const categoryFaqs = faqs.filter(f => f.categoryId === selectedFaqCategory);
    const idx = categoryFaqs.findIndex(f => f.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === categoryFaqs.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Swap
    const orderedIds = [...categoryFaqs].map(f => f.id);
    const temp = orderedIds[idx];
    orderedIds[idx] = orderedIds[targetIdx];
    orderedIds[targetIdx] = temp;

    const updated = await faqService.reorderFAQs(selectedFaqCategory, orderedIds);
    // Refresh FAQ list
    const allFaqs = await faqService.getFAQs();
    setFaqs(allFaqs);
    showToast('FAQ order updated');
  };

  // Media uploads simulation
  const handleMediaUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.name) {
      showToast('Please enter a file name', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeMediaUpload();
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const completeMediaUpload = async () => {
    try {
      const tagsArray = uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : ['UserUpload'];
      const fileMock = {
        name: uploadForm.name.includes('.') ? uploadForm.name : `${uploadForm.name}.jpg`,
        type: 'image',
        folder: uploadForm.folder,
        tags: tagsArray,
        size: '256 KB',
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60'
      };

      const uploaded = await mediaService.uploadFile(fileMock);
      cmsService.addAuditLog('Created', 'Media', uploaded.id, `Uploaded file "${uploaded.name}" into folder "${uploaded.folder}"`);
      
      const list = await mediaService.getMediaItems();
      setMediaItems(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);

      setIsUploading(false);
      setUploadProgress(0);
      setUploadForm({ name: '', folder: 'Banners', tags: '' });
      showToast(`File "${fileMock.name}" uploaded successfully!`);
    } catch (e) {
      showToast('Upload failed', 'error');
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete: "${name}"?`)) {
      await mediaService.deleteFile(id);
      cmsService.addAuditLog('Deleted', 'Media', id, `Deleted media file "${name}"`);
      showToast('File deleted');
      const list = await mediaService.getMediaItems();
      setMediaItems(list);
      const logs = await cmsService.getAuditLogs();
      setAuditLogs(logs);
    }
  };

  const handleCreateFolder = async () => {
    const fName = window.prompt('Enter new folder name:');
    if (!fName) return;
    try {
      await mediaService.createFolder(fName);
      const fList = await mediaService.getFolders();
      setFolders(fList);
      showToast(`Folder "${fName}" created`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Footer & Contact Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await cmsService.updateContactInfo(contactInfo);
      await cmsService.updateFooterContent(footerContent);
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  // Calculate metrics
  const activeBannersCount = banners.filter(b => b.status === 'Published').length;
  const activeFaqsCount = faqs.filter(f => f.status === 'Active').length;

  // Filter media items
  const filteredMediaItems = useMemo(() => {
    if (activeMediaFolder === 'All') return mediaItems;
    return mediaItems.filter(m => m.folder === activeMediaFolder);
  }, [mediaItems, activeMediaFolder]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Accessing Enterprise Content Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* ─── TOAST ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER ─── */}
      <section className="card-neo p-6 relative overflow-hidden flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase">Admin Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-3">
            <Globe size={24} className="text-purple-600" />
            Enterprise Content Management System
          </h2>
          <p className="text-xs text-gray-600 mt-1 font-medium max-w-2xl">
            Centralized portal to publish home banners, configure Terms/Privacy legal guidelines, control community notices, reorder FAQs, and upload media library resources.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Global Search CMS..." 
              value={globalSearchQuery}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 hover:bg-gray-200/70 focus:bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-medium w-48 xl:w-60 text-gray-800 transition-all"
            />
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            {globalSearchQuery && (
              <button 
                onClick={() => handleGlobalSearch('')}
                className="absolute right-3 top-3 text-[10px] font-black text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="h-8 w-[1px] bg-gray-300 hidden md:block"></div>

          {/* Quick Exports */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <span className="text-[9px] font-bold text-gray-500 px-2 uppercase">Export All</span>
            <button 
              onClick={() => handleExport('CSV', 'Global')}
              title="Export CSV" 
              className="p-1.5 hover:bg-white text-gray-600 hover:text-brand-primary rounded-lg transition-colors"
            >
              <FileSpreadsheet size={13} />
            </button>
            <button 
              onClick={() => handleExport('JSON', 'Global')}
              title="Export JSON" 
              className="p-1.5 hover:bg-white text-gray-600 hover:text-brand-primary rounded-lg transition-colors"
            >
              <FileJson size={13} />
            </button>
            <button 
              onClick={() => handleExport('PDF', 'Global')}
              title="Export PDF Document" 
              className="p-1.5 hover:bg-white text-gray-600 hover:text-brand-primary rounded-lg transition-colors"
            >
              <FileText size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── GLOBAL SEARCH RESULTS VIEW ─── */}
      {searchResults && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border border-brand-primary/20 rounded-2xl shadow-xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Search size={16} className="text-brand-primary" />
              Global Search Results for: "{globalSearchQuery}"
            </h3>
            <button 
              onClick={() => handleGlobalSearch('')}
              className="text-xs font-bold text-brand-primary hover:underline"
            >
              Close Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Banners */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Banners ({searchResults.banners.length})</h4>
              {searchResults.banners.length === 0 ? <p className="text-[11px] text-gray-400">No matching banners</p> : 
                searchResults.banners.map(b => (
                  <div key={b.id} onClick={() => { setActiveTab('banners'); handleGlobalSearch(''); }} className="p-2.5 bg-purple-50/50 hover:bg-purple-100/50 rounded-xl cursor-pointer border border-purple-100 transition-colors">
                    <p className="text-xs font-bold text-gray-800 truncate">{b.title}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase">{b.type}</span>
                  </div>
                ))
              }
            </div>

            {/* Pages */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Static Pages ({searchResults.pages.length})</h4>
              {searchResults.pages.length === 0 ? <p className="text-[11px] text-gray-400">No matching pages</p> : 
                searchResults.pages.map(p => (
                  <div key={p.id} onClick={() => { handlePageSelect(p.id); setActiveTab('pages'); handleGlobalSearch(''); }} className="p-2.5 bg-blue-50/50 hover:bg-blue-100/50 rounded-xl cursor-pointer border border-blue-100 transition-colors">
                    <p className="text-xs font-bold text-gray-800 truncate">{p.title}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase">{p.type}</span>
                  </div>
                ))
              }
            </div>



            {/* FAQs */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">FAQs Directory ({searchResults.faqs.length})</h4>
              {searchResults.faqs.length === 0 ? <p className="text-[11px] text-gray-400">No matching FAQs</p> : 
                searchResults.faqs.map(f => (
                  <div key={f.id} onClick={() => { setSelectedFaqCategory(f.categoryId); setActiveTab('faqs'); handleGlobalSearch(''); }} className="p-2.5 bg-amber-50/50 hover:bg-amber-100/50 rounded-xl cursor-pointer border border-amber-100 transition-colors">
                    <p className="text-xs font-bold text-gray-800 truncate">{f.question}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{f.answer}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── NAVIGATION WORKSTATION TABS ─── */}
      <div className="flex overflow-x-auto gap-2 bg-gray-900/5 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner no-scrollbar">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); handleGlobalSearch(''); }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all font-bold text-xs shrink-0 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <TabIcon size={15} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT WORKSPACES ─── */}
      <div className="min-h-[400px]">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Banners</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{activeBannersCount} / {banners.length}</h3>
                  <p className="text-[10px] text-brand-primary font-bold mt-1">Live Home Promo Sliders</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Layers size={22} /></div>
              </div>



              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Static Pages</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{pages.length} Pages</h3>
                  <p className="text-[10px] text-brand-primary font-bold mt-1">Legal Policies & Landing</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={22} /></div>
              </div>

              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Media Files</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{mediaItems.length} Uploads</h3>
                  <p className="text-[10px] text-brand-primary font-bold mt-1">Images, Docs & Icons</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><FolderOpen size={22} /></div>
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Audit logs */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">CMS Activity Audit Trail</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold uppercase tracking-wider">Real-Time</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Module</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3">Operator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                log.action === 'Created' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                log.action === 'Updated' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                log.action === 'Deleted' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold">{log.module}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate" title={log.details}>{log.details}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{log.user}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                  <button 
                    onClick={() => handleExport('CSV', 'AuditLogs')}
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1.5 justify-end ml-auto"
                  >
                    <Download size={12} /> Export Audit Log (CSV)
                  </button>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="lg:col-span-1 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Server size={16} className="text-cyan-500" />
                    Storage & API Nodes
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">Core Media Storage</span>
                      <span className="font-bold text-gray-800">42.8 MB / 5 GB (0.85%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-[1%] h-full bg-brand-primary rounded-full"></div>
                    </div>

                    <div className="border-t border-gray-100 pt-3.5 space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">API Gateway Latency</span>
                        <span className="font-bold text-emerald-500">12ms (Optimal)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">CMS Cache Status</span>
                        <span className="font-bold text-emerald-500">Hit Rate 98.4%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Database Sync</span>
                        <span className="font-bold text-indigo-500">2-Way Replica Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-3.5 border border-purple-100 rounded-xl">
                  <p className="text-[11px] text-brand-primary font-bold">API Readiness Info</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    This module is fully dynamic and interacts with Javascript services. Schema fields mapped are 100% compliant with standard CMS document models.
                  </p>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* ─── BANNER & SLIDER WORKSPACE ─── */}
        {activeTab === 'banners' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-gray-900">Banners, Promos & Hero Sliders</h3>
                <p className="text-xs text-gray-500">Display order affects position in homepage slideshows. Drag priority levels using controls.</p>
              </div>
              <button 
                onClick={() => handleOpenBannerModal()}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Add Banner
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold">
                    <th className="px-5 py-4 w-12 text-center">Order</th>
                    <th className="px-5 py-4">Image</th>
                    <th className="px-5 py-4">Banner Details</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Dates / Target</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banners.map((banner, index) => (
                    <tr key={banner.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            disabled={index === 0}
                            onClick={() => handleMoveBannerOrder(banner.id, 'up')}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <span className="font-black text-gray-900 text-xs">{banner.displayOrder}</span>
                          <button 
                            disabled={index === banners.length - 1}
                            onClick={() => handleMoveBannerOrder(banner.id, 'down')}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          className="w-16 h-10 object-cover rounded-lg border border-gray-200 bg-gray-100"
                        />
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <h4 className="font-bold text-gray-900 text-sm">{banner.title}</h4>
                        <p className="text-gray-500 mt-0.5 truncate">{banner.subtitle}</p>
                        <p className="text-[10px] text-brand-secondary font-medium truncate mt-1">CTA: {banner.ctaText} → {banner.ctaLink}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[9px] border border-gray-200">
                          {banner.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={11} />
                          <span>{banner.startDate} to {banner.endDate || 'Forever'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                          <Globe size={11} className="text-purple-400" />
                          <span>Target: {banner.targetAudience}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          banner.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          banner.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {banner.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleToggleBannerStatus(banner.id, banner.title)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black rounded-lg transition-colors"
                            title="Toggle Publish / Archive"
                          >
                            {banner.status === 'Published' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </button>
                          <button 
                            onClick={() => handleDuplicateBanner(banner.id, banner.title)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black rounded-lg transition-colors"
                            title="Duplicate Banner"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={() => handleOpenBannerModal(banner)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black rounded-lg transition-colors"
                            title="Edit Banner"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBanner(banner.id, banner.title)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ─── ANNOUNCEMENTS & NOTICES WORKSPACE ─── */}
        {activeTab === 'announcements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-bold text-gray-900">Platform Announcements, Notices & News</h3>
                <p className="text-xs text-gray-500">Configure target groups for platform-wide alerts, local updates, or community moderators.</p>
              </div>
              <button 
                onClick={() => handleOpenAnnModal()}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Post Notice
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-purple-200 transition-all space-y-4 relative">
                  {ann.isPinned && (
                    <span className="absolute top-4 right-4 text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                      <Pin size={10} /> PINNED
                    </span>
                  )}

                  <div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        ann.type === 'announcement' ? 'bg-purple-100 text-purple-700' :
                        ann.type === 'notice' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[8px] font-bold uppercase">
                        Target: {ann.targetType}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-955 text-sm mt-3.5 leading-tight">{ann.title}</h4>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">{ann.content}</p>
                    
                    <div className="mt-4 pt-3.5 border-t border-gray-100 space-y-1.5 text-[10px] text-gray-400">
                      <p className="flex items-center gap-1"><Clock size={11} /> Posted: {new Date(ann.createdAt).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1"><Calendar size={11} /> Schedule: {ann.startDate} to {ann.endDate || 'Active'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      ann.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ann.status}
                    </span>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleTogglePinAnn(ann.id, ann.title, ann.isPinned)}
                        className={`p-1.5 rounded-lg border transition-colors ${ann.isPinned ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
                        title="Pin to top feed"
                      >
                        <Pin size={12} />
                      </button>
                      <button 
                        onClick={() => handleOpenAnnModal(ann)}
                        className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-black rounded-lg border transition-colors"
                        title="Edit Notice"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAnn(ann.id, ann.title)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-transparent transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── PAGE BUILDER & SPLIT PREVIEW WORKSPACE ─── */}
        {activeTab === 'pages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* Page selection toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Select Page:</span>
                <div className="flex flex-wrap gap-1.5">
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePageSelect(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedPageId === p.id 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSavePage}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 shadow press-scale"
                >
                  <Check size={14} /> Save Page Content
                </button>
                <button 
                  onClick={() => handleExport('JSON', 'Pages')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 border border-gray-300"
                >
                  <Download size={13} /> Export Content
                </button>
              </div>
            </div>

            {/* Split screen editor workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Markdown editor (5 cols) */}
              <div className="xl:col-span-5 flex flex-col bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900">Split Document Editor</h3>
                  <span className="text-[10px] font-black tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">MARKDOWN READY</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Page Document Title</label>
                  <input 
                    type="text" 
                    value={pageEditorTitle}
                    onChange={(e) => setPageEditorTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-55/40 hover:bg-gray-55/60 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-800 font-bold"
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Document Markdown Content</label>
                    <span className="text-[9px] text-gray-400 font-bold">Auto-renders on right panel</span>
                  </div>
                  <textarea 
                    value={pageEditorContent}
                    onChange={(e) => setPageEditorContent(e.target.value)}
                    rows={16}
                    placeholder="Enter document text support markdown formatting..."
                    className="w-full flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary text-xs text-gray-700 font-mono leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Dynamic Live Preview frame (7 cols) */}
              <div className="xl:col-span-7 flex flex-col bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4 justify-between">
                
                {/* Visual preview navbar */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Live Frame Rendering</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  
                  {/* Device toggle switches */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button 
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'desktop' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'}`}
                      title="Desktop Preview"
                    >
                      <Monitor size={14} />
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'tablet' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'}`}
                      title="Tablet Preview"
                    >
                      <Tablet size={14} />
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition-colors ${previewDevice === 'mobile' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'}`}
                      title="Mobile Preview"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                </div>

                {/* Simulated rendering workspace container */}
                <div className="flex-1 bg-gray-100 rounded-2xl p-4 flex items-center justify-center min-h-[380px] overflow-hidden">
                  <div 
                    className="h-full bg-white shadow-lg border border-gray-200/50 rounded-xl overflow-y-auto no-scrollbar transition-all duration-300 p-6"
                    style={{ 
                      width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '700px' : '100%',
                      height: '100%',
                      maxHeight: '440px'
                    }}
                  >
                    {/* Rendered content */}
                    <div className="prose prose-purple prose-sm max-w-none text-left">
                      <span className="text-[8px] font-black uppercase tracking-wider text-brand-primary bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Live Preview Mode</span>
                      <h1 className="text-xl font-black text-gray-950 mt-3 border-b border-gray-100 pb-1.5">{pageEditorTitle}</h1>
                      
                      <div className="text-xs text-gray-700 leading-relaxed mt-4 space-y-4 whitespace-pre-line">
                        {pageEditorContent || <p className="text-gray-400 italic">No content written yet. Start typing on the editor tab...</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline and History rollback section */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <History size={12} /> Document Version Timeline & Backups
                  </h4>
                  
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {pages.find(p => p.id === selectedPageId)?.versions.map((ver) => (
                      <div 
                        key={ver.versionId} 
                        className={`p-2.5 rounded-xl border shrink-0 flex flex-col justify-between text-left transition-all ${
                          pageSelectedVersion === ver.versionId 
                            ? 'bg-brand-primary/5 border-brand-primary w-40' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 w-36 cursor-pointer'
                        }`}
                        onClick={() => setPageSelectedVersion(ver.versionId)}
                      >
                        <div>
                          <p className="text-[11px] font-bold text-gray-800 truncate">{ver.title}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Author: {ver.updatedBy}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-gray-100">
                          <span className="text-[9px] text-gray-500 font-mono">Ver #{ver.versionId}</span>
                          {pageSelectedVersion === ver.versionId ? (
                            <button 
                              onClick={() => handleRestoreVersion(ver.versionId)}
                              className="text-[9px] text-brand-primary font-bold hover:underline flex items-center gap-0.5"
                            >
                              <CornerUpLeft size={10} /> Restore
                            </button>
                          ) : (
                            <span className="text-[9px] text-gray-400">View</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* ─── FAQ DIRECTORY WORKSPACE ─── */}
        {activeTab === 'faqs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* Category selections */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex overflow-x-auto gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 no-scrollbar">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFaqCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedFaqCategory === cat.id 
                        ? 'bg-white text-brand-primary shadow-sm' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button 
                  onClick={handleCreateFolder}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50 whitespace-nowrap flex items-center gap-1"
                >
                  <Plus size={12} /> Category
                </button>
              </div>

              <button 
                onClick={() => handleOpenFaqModal()}
                className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            {/* List questions under active category */}
            <div className="space-y-3">
              {faqs.filter(f => f.categoryId === selectedFaqCategory).length === 0 ? (
                <div className="text-center py-10 bg-white border border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-500 font-medium">No FAQ questions registered under this category yet.</p>
                  <button onClick={() => handleOpenFaqModal()} className="mt-3 text-xs text-brand-primary font-bold hover:underline">
                    Create the first FAQ Question
                  </button>
                </div>
              ) : (
                faqs.filter(f => f.categoryId === selectedFaqCategory).map((faq, index, arr) => (
                  <div key={faq.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-200 transition-all shadow-sm">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{faq.question}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          faq.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {faq.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">{faq.answer}</p>
                    </div>

                    {/* Order buttons + Controls */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-t-0 border-gray-100 pt-2.5 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-1 border border-gray-200 p-0.5 rounded-lg bg-gray-50">
                        <button 
                          disabled={index === 0}
                          onClick={() => handleMoveFaqOrder(faq.id, 'up')}
                          className="p-1 hover:bg-white rounded text-gray-500 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <span className="text-[9px] font-black text-gray-500 px-1">{index + 1}</span>
                        <button 
                          disabled={index === arr.length - 1}
                          onClick={() => handleMoveFaqOrder(faq.id, 'down')}
                          className="p-1 hover:bg-white rounded text-gray-500 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleToggleFaqStatus(faq.id, faq.question, faq.status)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-black rounded-lg transition-colors border border-transparent"
                          title="Toggle Status"
                        >
                          {faq.status === 'Active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button 
                          onClick={() => handleOpenFaqModal(faq)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-black rounded-lg transition-colors border border-transparent"
                          title="Edit FAQ"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFaq(faq.id, faq.question)}
                          className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-transparent"
                          title="Delete FAQ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}

        {/* ─── CENTRALIZED MEDIA LIBRARY WORKSPACE ─── */}
        {activeTab === 'media' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            
            {/* Left Column: Folders Sidebar & File Uploader */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Folders navigation */}
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Library Folders</h3>
                  <button onClick={handleCreateFolder} className="text-brand-primary font-bold text-xs hover:underline flex items-center gap-0.5">
                    <Plus size={12} /> New
                  </button>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => setActiveMediaFolder('All')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeMediaFolder === 'All' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Folder size={14} /> All Uploads</span>
                    <span className="text-[10px] font-bold text-gray-450">{mediaItems.length}</span>
                  </button>
                  {folders.map((f) => {
                    const count = mediaItems.filter(m => m.folder === f).length;
                    return (
                      <button
                        key={f}
                        onClick={() => setActiveMediaFolder(f)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          activeMediaFolder === f ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Folder size={14} /> {f}</span>
                        <span className="text-[10px] font-bold text-gray-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload simulator form */}
              <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2.5">Simulate File Uploader</h3>
                
                {isUploading ? (
                  <div className="space-y-3.5 py-4 text-center">
                    <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[11px] text-gray-500 font-bold animate-pulse">Uploading file to platform bucket...</p>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleMediaUpload} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase">File Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. matrimony_header" 
                        value={uploadForm.name}
                        onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Folder</label>
                        <select 
                          value={uploadForm.folder}
                          onChange={(e) => setUploadForm({ ...uploadForm, folder: e.target.value })}
                          className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
                        >
                          {folders.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Tags (comma sep)</label>
                        <input 
                          type="text" 
                          placeholder="UI, Logo" 
                          value={uploadForm.tags}
                          onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                          className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider press-scale flex items-center justify-center gap-1.5 shadow"
                    >
                      <Upload size={13} /> Select & Upload File
                    </button>
                  </form>
                )}
              </div>

            </div>

            {/* Right Column: Files Grid Workspace (3 cols) */}
            <div className="xl:col-span-3 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Folder: <span className="text-brand-primary">{activeMediaFolder}</span>
                </h3>
                <span className="text-xs text-gray-500 font-medium">Found {filteredMediaItems.length} files</span>
              </div>

              {filteredMediaItems.length === 0 ? (
                <div className="text-center py-20">
                  <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-bold">This folder is empty.</p>
                  <p className="text-xs text-gray-400 mt-1">Use the upload simulator on the left panel to insert dummy files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMediaItems.map((media) => (
                    <div key={media.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50 hover:bg-gray-100/50 flex flex-col justify-between group transition-all relative">
                      
                      {/* Image Thumbnail or File Icon */}
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-200 relative">
                        {media.type === 'image' ? (
                          <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                        ) : media.type === 'icon' ? (
                          <img src={media.url} alt={media.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full"><FileText size={24} /></div>
                        )}
                        
                        {/* Hover Overlay Delete */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => window.open(media.url, '_blank')} 
                            className="p-1.5 bg-white text-gray-800 rounded-lg hover:bg-gray-200"
                            title="Preview Link"
                          >
                            <Eye size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMedia(media.id, media.name)} 
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            title="Delete File"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-2.5 space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-800 truncate" title={media.name}>{media.name}</p>
                        
                        <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                          <span>{media.size}</span>
                          <span className="uppercase text-brand-secondary bg-purple-50 px-1 rounded">{media.type}</span>
                        </div>

                        {/* File tags */}
                        <div className="flex flex-wrap gap-0.5 pt-1">
                          {media.tags.map(tag => (
                            <span key={tag} className="text-[8px] bg-gray-150 text-gray-600 px-1 rounded flex items-center gap-0.5 border border-gray-200">
                              <Tag size={6} /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* ─── SETTINGS: FOOTER & CONTACT DETAILS ─── */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Platform Contact & Footer Configuration</h3>
                  <p className="text-xs text-gray-500">Edit general corporate contact info and bottom-footer content links dynamically.</p>
                </div>
                <button 
                  type="submit" 
                  className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
                >
                  <Check size={14} /> Update Settings
                </button>
              </div>

              {/* 2 Column Form layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1"><Mail size={13} /> Support Desk Contact Details</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Support Email</label>
                    <input 
                      type="email" 
                      value={contactInfo.email || ''} 
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Hotline Number</label>
                    <input 
                      type="text" 
                      value={contactInfo.phone || ''} 
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Corporate Head Office Address</label>
                    <textarea 
                      rows={2} 
                      value={contactInfo.address || ''} 
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Support Operational Hours</label>
                    <input 
                      type="text" 
                      value={contactInfo.workingHours || ''} 
                      onChange={(e) => setContactInfo({ ...contactInfo, workingHours: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Footer and Social Links */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1"><ExternalLink size={13} /> Footer Taglines & Socials</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Copyright Footer Tag</label>
                    <input 
                      type="text" 
                      value={footerContent.copyright || ''} 
                      onChange={(e) => setFooterContent({ ...footerContent, copyright: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Brand Tagline</label>
                    <input 
                      type="text" 
                      value={footerContent.tagline || ''} 
                      onChange={(e) => setFooterContent({ ...footerContent, tagline: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-700 font-semibold"
                    />
                  </div>

                  {footerContent.socialLinks && (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Facebook URL</label>
                        <input 
                          type="text" 
                          value={footerContent.socialLinks.facebook || ''} 
                          onChange={(e) => setFooterContent({
                            ...footerContent,
                            socialLinks: { ...footerContent.socialLinks, facebook: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Instagram URL</label>
                        <input 
                          type="text" 
                          value={footerContent.socialLinks.instagram || ''} 
                          onChange={(e) => setFooterContent({
                            ...footerContent,
                            socialLinks: { ...footerContent.socialLinks, instagram: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </form>
          </motion.div>
        )}
      </div>

      {/* ─── BANNER FORM MODAL ─── */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBannerModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-xl bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <Layers size={18} className="text-purple-400" />
                {selectedBanner ? 'Modify Sliding Banner' : 'Create Banner / Slider Campaign'}
              </h3>
              <button onClick={() => setBannerModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Banner Segment Type</label>
                  <select 
                    value={bannerForm.type}
                    onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="hero">Main Hero Slider</option>
                    <option value="home">General Home Banner</option>
                    <option value="promo">Promotional Banner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Priority weight (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={bannerForm.priority}
                    onChange={(e) => setBannerForm({ ...bannerForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Banner Headline *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Welcome to our platform"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Sub-headline Description</label>
                <input 
                  type="text" 
                  placeholder="Short description here..."
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">CTA Action Button Text</label>
                  <input 
                    type="text" 
                    placeholder="Register" 
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">CTA Destination Link</label>
                  <input 
                    type="text" 
                    placeholder="/member/register" 
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Background Image URL *</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://images.unsplash.com/..." 
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Schedule Start Date</label>
                  <input 
                    type="date" 
                    value={bannerForm.startDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Schedule End Date (Optional)</label>
                  <input 
                    type="date" 
                    value={bannerForm.endDate}
                    onChange={(e) => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Initial Status</label>
                  <select 
                    value={bannerForm.status}
                    onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="Draft">Draft Mode</option>
                    <option value="Published">Published Live</option>
                    <option value="Scheduled">Scheduled Campaign</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Target Audience Scope</label>
                  <select 
                    value={bannerForm.targetAudience}
                    onChange={(e) => setBannerForm({ ...bannerForm, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="All">All Public Users</option>
                    <option value="Members">Verified Members Only</option>
                    <option value="Heads">Community Council Heads</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale mt-2"
              >
                {selectedBanner ? 'Update Campaign Details' : 'Launch Banner Campaign'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── ANNOUNCEMENT FORM MODAL ─── */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAnnModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-xl bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <Megaphone size={18} className="text-purple-400" />
                {selectedAnn ? 'Edit Notification' : 'Compose Alert & Notices'}
              </h3>
              <button onClick={() => setAnnModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAnn} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Alert Classification</label>
                  <select 
                    value={annForm.type}
                    onChange={(e) => setAnnForm({ ...annForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="announcement">Global Announcement</option>
                    <option value="notice">System Notice</option>
                    <option value="news">Platform Local News</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Target Audience</label>
                  <select 
                    value={annForm.targetType}
                    onChange={(e) => setAnnForm({ ...annForm, targetType: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="Platform">Entire Platform</option>
                    <option value="Communities">Selected Communities</option>
                    <option value="Cities">Selected Cities</option>
                    <option value="CommunityHeads">Community Council Heads</option>
                    <option value="Members">Verified Members</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Alert Title / Headline *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Notice Headline..."
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Main content body *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Type official details..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Schedule Start Date</label>
                  <input 
                    type="date" 
                    value={annForm.startDate}
                    onChange={(e) => setAnnForm({ ...annForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Schedule End Date (Optional)</label>
                  <input 
                    type="date" 
                    value={annForm.endDate}
                    onChange={(e) => setAnnForm({ ...annForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Campaign Status</label>
                  <select 
                    value={annForm.status}
                    onChange={(e) => setAnnForm({ ...annForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Publish Immediately</option>
                    <option value="Scheduled">Schedule for Later</option>
                    <option value="Expired">Expire Archive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="isPinned"
                    checked={annForm.isPinned}
                    onChange={(e) => setAnnForm({ ...annForm, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-brand-primary"
                  />
                  <label htmlFor="isPinned" className="text-xs font-bold text-purple-200 cursor-pointer">Pin to Dashboard Top Feed</label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale mt-2"
              >
                {selectedAnn ? 'Save Alert Updates' : 'Publish Notice Broadcast'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ─── FAQ FORM MODAL ─── */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFaqModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-lg bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-purple-400" />
                {selectedFaq ? 'Modify FAQ Entry' : 'Create FAQ Resource'}
              </h3>
              <button onClick={() => setFaqModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Target FAQ Category</label>
                  <select 
                    value={faqForm.categoryId}
                    onChange={(e) => setFaqForm({ ...faqForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    {faqCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-purple-200 uppercase">Default Status</label>
                  <select 
                    value={faqForm.status}
                    onChange={(e) => setFaqForm({ ...faqForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="Active">Active Visible</option>
                    <option value="Inactive">Disabled Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Question Headline *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. How do I edit my profile details?" 
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-200 uppercase">Collapsible Answer Body *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Enter helpful response..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale mt-2"
              >
                {selectedFaq ? 'Update FAQ Entry' : 'Launch FAQ Question'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default ContentManagementSystem;
