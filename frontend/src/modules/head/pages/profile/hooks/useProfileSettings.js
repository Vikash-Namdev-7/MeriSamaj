import { useState, useEffect, useCallback, useMemo } from 'react';
import { getHeadProfile, updateHeadProfile, getCommunityStats, uploadProfileAvatar } from '../services/profileService';
import { calculateProfileCompletion, getMissingFields } from '../utils/profileHelpers';

export const useProfileSettings = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          getHeadProfile(),
          getCommunityStats()
        ]);
        setProfile(profileData);
        setOriginalProfile(profileData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = useCallback((field, value) => {
    setProfile(prev => {
      const next = { ...prev, [field]: value };
      setUnsavedChanges(JSON.stringify(next) !== JSON.stringify(originalProfile));
      return next;
    });
  }, [originalProfile]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await updateHeadProfile(profile);
      setOriginalProfile(profile);
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setProfile(originalProfile);
    setUnsavedChanges(false);
  };

  const handleAvatarUpload = async (file) => {
    try {
      const { url } = await uploadProfileAvatar(file);
      handleChange('avatar', url);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const completionPercentage = useMemo(() => calculateProfileCompletion(profile), [profile]);
  const missingFields = useMemo(() => getMissingFields(profile), [profile]);

  return {
    profile,
    stats,
    loading,
    saving,
    unsavedChanges,
    handleChange,
    saveChanges,
    discardChanges,
    handleAvatarUpload,
    completionPercentage,
    missingFields
  };
};
