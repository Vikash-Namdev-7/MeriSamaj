/**
 * useMatrimonialProfile.js
 * Hook for managing own matrimonial profile — create, update, fetch.
 */
import { useState, useCallback } from 'react';
import { matrimonialProfileService } from '../core/api/matrimonialService';

export const useMatrimonialProfile = () => {
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);

  const fetchMyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matrimonialProfileService.getMyProfile();
      setProfile(res.data.data.profile);
      return res.data.data.profile;
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load profile');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (data, isNew = false) => {
    setSaving(true);
    setError(null);
    try {
      const res = isNew
        ? await matrimonialProfileService.createProfile(data)
        : await matrimonialProfileService.updateProfile(data);
      setProfile(res.data.data.profile);
      return { success: true, profile: res.data.data.profile };
    } catch (err) {
      let msg = 'Failed to save profile';
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        msg = err.response.data.errors.map(e => e.msg).join(', ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    setSaving(true);
    try {
      await matrimonialProfileService.deleteProfile();
      setProfile(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, fetchMyProfile, saveProfile, deleteProfile };
};
