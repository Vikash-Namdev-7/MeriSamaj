/**
 * Shared Exporter Utilities — CSV & JSON exports for Admin & Head panels.
 */

export const exportToJson = (data, filename = 'export.json') => {
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

export const exportToCsv = (data, filename = 'export.csv') => {
  try {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn('No data to export to CSV');
      return false;
    }

    let csvRows = [];

    if (Array.isArray(data)) {
      // Array of objects case
      const headers = Object.keys(data[0] || {});
      csvRows.push(headers.map(h => `"${h}"`).join(','));

      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          if (val === null || val === undefined) return '""';
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${valStr.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
    } else if (typeof data === 'object') {
      // Key-Value object case
      csvRows.push('Key,Value');
      for (const [key, value] of Object.entries(data)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        csvRows.push(`"${key}","${valStr.replace(/"/g, '""')}"`);
      }
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
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
