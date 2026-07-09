// cityService.js
// Mock service for City Management (API-Ready)

const mockCities = [
  {
    id: 'ct-1',
    name: 'Indore',
    code: 'IND',
    state: 'Madhya Pradesh',
    country: 'India',
    status: 'Active',
    communitiesCount: 12,
    membersCount: 4500,
    headsCount: 12,
    eventsCount: 34,
    revenue: '₹12,50,000',
    description: 'Central hub for Madhya Pradesh Samaj activities.',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'ct-2',
    name: 'Bhopal',
    code: 'BHO',
    state: 'Madhya Pradesh',
    country: 'India',
    status: 'Active',
    communitiesCount: 8,
    membersCount: 2800,
    headsCount: 8,
    eventsCount: 15,
    revenue: '₹8,20,000',
    description: 'Capital city operations.',
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
  },
  {
    id: 'ct-3',
    name: 'Ujjain',
    code: 'UJJ',
    state: 'Madhya Pradesh',
    country: 'India',
    status: 'Active',
    communitiesCount: 4,
    membersCount: 1200,
    headsCount: 4,
    eventsCount: 8,
    revenue: '₹4,50,000',
    description: 'Religious and cultural hub.',
    createdAt: '2023-03-10T10:00:00Z',
    updatedAt: '2024-07-05T10:00:00Z',
  },
  {
    id: 'ct-4',
    name: 'Jabalpur',
    code: 'JAB',
    state: 'Madhya Pradesh',
    country: 'India',
    status: 'Disabled',
    communitiesCount: 2,
    membersCount: 450,
    headsCount: 2,
    eventsCount: 1,
    revenue: '₹1,00,000',
    description: 'Operations temporarily suspended for restructuring.',
    createdAt: '2023-06-05T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  }
];

export const cityService = {
  /**
   * Fetch all cities
   * @returns {Promise<Array>} Array of city objects
   */
  fetchCities: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockCities]);
      }, 800);
    });
  },

  /**
   * Add a new city
   * @param {Object} cityData 
   * @returns {Promise<Object>} Created city
   */
  addCity: async (cityData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCity = {
          id: `ct-${Date.now()}`,
          ...cityData,
          communitiesCount: 0,
          membersCount: 0,
          headsCount: 0,
          eventsCount: 0,
          revenue: '₹0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newCity);
      }, 600);
    });
  },

  /**
   * Update an existing city
   * @param {string} id 
   * @param {Object} cityData 
   * @returns {Promise<Object>} Updated city
   */
  updateCity: async (id, cityData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          ...cityData,
          updatedAt: new Date().toISOString(),
        });
      }, 600);
    });
  },

  /**
   * Delete or archive a city
   * @param {string} id 
   * @returns {Promise<boolean>} Success status
   */
  deleteCity: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 600);
    });
  }
};
