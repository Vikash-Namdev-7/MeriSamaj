import { useState, useEffect, useCallback } from 'react';
import { cityService } from '../services/cityService';

export const useCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cityService.fetchCities();
      setCities(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch cities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const addCity = async (cityData) => {
    try {
      const newCity = await cityService.addCity(cityData);
      setCities(prev => [newCity, ...prev]);
      return { success: true, data: newCity };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCity = async (id, cityData) => {
    try {
      const updated = await cityService.updateCity(id, cityData);
      setCities(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCity = async (id) => {
    try {
      await cityService.deleteCity(id);
      setCities(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const toggleCityStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    return await updateCity(id, { status: newStatus });
  };

  return {
    cities,
    loading,
    error,
    refreshCities: fetchCities,
    addCity,
    updateCity,
    deleteCity,
    toggleCityStatus
  };
};
