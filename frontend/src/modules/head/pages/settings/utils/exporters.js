/**
 * Utility functions for exporting community settings.
 */

export const exportToJson = (data, filename = 'community_settings_export.json') => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    return true;
  } catch (error) {
    console.error('Failed to export JSON:', error);
    return false;
  }
};

export const exportToCsv = (data, filename = 'community_settings_export.csv') => {
  try {
    // Flatten simple objects for CSV
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {});
    };

    const flatData = flattenObject(data);
    const csvRows = ['Key,Value'];
    
    for (const [key, value] of Object.entries(flatData)) {
      const valStr = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      csvRows.push(`"${key}",${valStr}`);
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
};
