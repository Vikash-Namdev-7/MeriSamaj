const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const exportData = async (type, format) => {
  await delay(1500);
  return { 
    success: true, 
    message: `Exported ${type} in ${format} format successfully.`,
    url: '#' // Mock download URL
  };
};
