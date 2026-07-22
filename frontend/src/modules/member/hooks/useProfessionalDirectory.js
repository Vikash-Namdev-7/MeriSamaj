import { useState, useEffect } from 'react';
import { cardColors } from '../data/mockProfessionals';
import { professionalService } from '../../../core/api/professionalService';

// ─────────────────────────────────────────────────────────────────────────────
//  useProfessionalDirectory — API Custom Hook
// ─────────────────────────────────────────────────────────────────────────────

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
        const res = await professionalService.getProfessionals();
        const apiListings = res.success ? res.data : [];

        // Enrich listings with card colors
        const enriched = apiListings.map((item, idx) => ({
          ...item,
          color: item.color || cardColors[idx % cardColors.length],
        }));

        // Fetch active categories dynamically from backend
        const catRes = await professionalService.getCategories();
        const apiCategories = catRes.success ? catRes.data : [];

        const colorPalette = [
          { text: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: 'GraduationCap' },
          { text: 'text-rose-600 bg-rose-50 border-rose-100', icon: 'Heart' },
          { text: 'text-gray-650 bg-gray-50 border-gray-100', icon: 'MoreHorizontal' },
          { text: 'text-sky-600 bg-sky-50 border-sky-100', icon: 'Hammer' },
          { text: 'text-orange-600 bg-orange-50 border-orange-100', icon: 'Building' },
          { text: 'text-violet-600 bg-violet-50 border-violet-100', icon: 'Briefcase' }
        ];

        let derivedCategories = apiCategories.map((cat, idx) => {
          const colorMatch = colorPalette[idx % colorPalette.length];
          return {
            id: cat.key,
            name: cat.name,
            categoryKey: cat.key,
            iconName: cat.icon || colorMatch.icon,
            color: colorMatch.text
          };
        });

        // Ensure "Others" category is placed at the very end of the list
        const othersIndex = derivedCategories.findIndex(c => c.categoryKey?.toLowerCase() === 'others');
        if (othersIndex > -1) {
          const othersCat = derivedCategories[othersIndex];
          derivedCategories.splice(othersIndex, 1);
          derivedCategories.push(othersCat);
        }

        // Derive unique cities dynamically from data and API fallback
        let uniqueCities = ['All Cities', ...new Set(enriched.map(p => p.city).filter(Boolean).sort())];
        try {
          const { axiosPublic } = await import('../../../core/api/axiosConfig');
          const citiesRes = await axiosPublic.get('/auth/cities');
          if (citiesRes.data.success) {
            const apiCityNames = citiesRes.data.data.map(c => c.name);
            uniqueCities = ['All Cities', ...new Set([...uniqueCities, ...apiCityNames]).sort()];
          }
        } catch (cityErr) {
          console.error('Failed to fetch API cities for directory:', cityErr);
        }

        setListings(enriched);
        setCategories(derivedCategories);
        setCities(uniqueCities);

      } catch (err) {
        console.error('[useProfessionalDirectory] Error:', err);
        setError(err.message || 'Failed to load professional listings.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [communityId]);

  return { listings, categories, cities, isLoading, error };
};

export default useProfessionalDirectory;
