import { useState, useEffect, useMemo } from 'react';
import { mockProfessionals, categoryIconMap, cardColors } from '../data/mockProfessionals';

// ─────────────────────────────────────────────────────────────────────────────
//  useProfessionalDirectory — API-Ready Custom Hook
// ─────────────────────────────────────────────────────────────────────────────
//
//  अभी:  Mock data से data load करता है (instant, offline-ready)
//
//  Backend connect करने पर — बस इस hook में ये बदलाव करें:
//
//    1. नीचे "MOCK DATA LAYER" block को हटाएं
//    2. Uncomment करें "API DATA LAYER" block
//    3. API_BASE_URL और endpoint सही करें
//    4. Page component को कुछ नहीं बदलना पड़ेगा ✅
//
//  API Endpoints Expected:
//    GET /api/professionals?communityId=xxx          → listings array
//    GET /api/professionals/categories?communityId=xxx → categories array
//
// ─────────────────────────────────────────────────────────────────────────────

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const useProfessionalDirectory = (communityId) => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ─── MOCK DATA LAYER ─────────────────────────────────────────────────
        // जब API तैयार हो तो यह block हटाएं और नीचे API LAYER uncomment करें

        await new Promise(resolve => setTimeout(resolve, 300)); // simulate network delay

        // Enrich mock data: auto-assign color by index
        const localListingsRaw = localStorage.getItem('merisamaj_custom_professionals');
        const localListings = localListingsRaw ? JSON.parse(localListingsRaw) : [];
        const combined = [...localListings, ...mockProfessionals];

        const enriched = combined.map((item, idx) => ({
          ...item,
          color: item.color || cardColors[idx % cardColors.length],
        }));

        // Derive unique categories dynamically from data
        const uniqueCategoryKeys = [...new Set(enriched.map(p => p.categoryKey || p.category?.toLowerCase() || 'others'))];
        const derivedCategories = uniqueCategoryKeys
          .map(key => {
            const config = categoryIconMap[key] || categoryIconMap.others;
            return {
              id: key,
              name: config.labelHi || key.toUpperCase(),
              categoryKey: key,
              icon: config.icon,
              color: config.color,
            };
          });

        // Derive unique cities dynamically from data
        const uniqueCities = ['All Cities', ...new Set(enriched.map(p => p.city).sort())];

        setListings(enriched);
        setCategories(derivedCategories);
        setCities(uniqueCities);

        // ─── API DATA LAYER ────────────────────────────────────────────────────
        // Backend connect होने पर यह uncomment करें:
        //
        // const [listRes, catRes] = await Promise.all([
        //   fetch(`${API_BASE_URL}/api/professionals?communityId=${communityId}`),
        //   fetch(`${API_BASE_URL}/api/professionals/categories?communityId=${communityId}`),
        // ]);
        //
        // if (!listRes.ok || !catRes.ok) throw new Error('Failed to load data');
        //
        // const listData = await listRes.json();   // array of professional objects
        // const catData  = await catRes.json();    // array of { key, labelHi }
        //
        // // Enrich listings with colors
        // const enriched = listData.map((item, idx) => ({
        //   ...item,
        //   color: cardColors[idx % cardColors.length],
        // }));
        //
        // // Build category UI config from API + iconMap
        // const derivedCategories = catData.map(cat => {
        //   const config = categoryIconMap[cat.key] || categoryIconMap.others;
        //   return { id: cat.key, name: cat.labelHi, categoryKey: cat.key, icon: config.icon, color: config.color };
        // });
        //
        // // Derive cities from data
        // const uniqueCities = ['All Cities', ...new Set(enriched.map(p => p.city).sort())];
        //
        // setListings(enriched);
        // setCategories(derivedCategories);
        // setCities(uniqueCities);
        // ─────────────────────────────────────────────────────────────────────

      } catch (err) {
        console.error('[useProfessionalDirectory] Error:', err);
        setError(err.message || 'डेटा लोड करने में समस्या हुई।');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [communityId]);

  return { listings, categories, cities, isLoading, error };
};

export default useProfessionalDirectory;
