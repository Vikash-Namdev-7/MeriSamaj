/**
 * Service for branding and image uploads.
 * Simulates uploading images and returning CDNs.
 */

export const uploadCommunityImage = async (communityId, imageType, file) => {
  return new Promise((resolve, reject) => {
    // Simulate upload delay
    setTimeout(() => {
      if (!file) {
        return reject(new Error('No file provided'));
      }
      
      // Create a fake object URL to simulate a CDN URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      resolve({
        success: true,
        url: objectUrl,
        type: imageType
      });
    }, 1500);
  });
};

export const fetchBrandingAssets = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saved = localStorage.getItem(`community_branding_${communityId}`);
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        resolve({
          logo: null,
          darkLogo: null,
          mobileLogo: null,
          favicon: null,
          homepageBanner: null,
          coverBanner: null,
          welcomeBanner: null,
          watermark: null
        });
      }
    }, 600);
  });
};

export const updateBrandingAssets = async (communityId, payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`community_branding_${communityId}`, JSON.stringify(payload));
      resolve({ success: true });
    }, 800);
  });
};
