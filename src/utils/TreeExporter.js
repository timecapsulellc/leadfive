import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class TreeExporter {
  constructor() {
    this.defaultOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0F0F23',
      width: null,
      height: null,
    };
  }

  /**
   * Export tree as PNG image
   */
  async exportToPNG(elementId, filename = 'genealogy-tree.png', options = {}) {
    try {
      const element =
        document.getElementById(elementId) || document.querySelector(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      // Prepare element for export
      const originalStyle = this.prepareElementForExport(element);

      const canvas = await html2canvas(element, {
        ...this.defaultOptions,
        ...options,
      });

      // Restore original style
      this.restoreElementStyle(element, originalStyle);

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      return canvas;
    } catch (error) {
      console.error('Export to PNG failed:', error);
      throw error;
    }
  }

  /**
   * Export tree as PDF
   */
  async exportToPDF(elementId, filename = 'genealogy-tree.pdf', options = {}) {
    try {
      const element =
        document.getElementById(elementId) || document.querySelector(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      // Prepare element for export
      const originalStyle = this.prepareElementForExport(element);

      const canvas = await html2canvas(element, {
        ...this.defaultOptions,
        ...options,
      });

      // Restore original style
      this.restoreElementStyle(element, originalStyle);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);

      return pdf;
    } catch (error) {
      console.error('Export to PDF failed:', error);
      throw error;
    }
  }

  /**
   * Export tree data as JSON
   */
  exportDataAsJSON(treeData, filename = 'genealogy-data.json') {
    try {
      const dataStr = JSON.stringify(treeData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export data as JSON failed:', error);
      throw error;
    }
  }

  /**
   * Export tree data as CSV
   */
  exportDataAsCSV(treeData, filename = 'genealogy-data.csv') {
    try {
      const flatData = this.flattenTreeData(treeData);
      const csv = this.convertToCSV(flatData);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export data as CSV failed:', error);
      throw error;
    }
  }

  /**
   * Prepare element for better export quality
   */
  prepareElementForExport(element) {
    const originalStyle = {
      transform: element.style.transform,
      width: element.style.width,
      height: element.style.height,
      position: element.style.position,
      overflow: element.style.overflow,
    };

    // Temporarily modify styles for better export
    element.style.transform = 'scale(1)';
    element.style.width = 'auto';
    element.style.height = 'auto';
    element.style.position = 'static';
    element.style.overflow = 'visible';

    // Remove any transitions that might interfere
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
    });

    return originalStyle;
  }

  /**
   * Restore element's original style
   */
  restoreElementStyle(element, originalStyle) {
    Object.keys(originalStyle).forEach(key => {
      element.style[key] = originalStyle[key];
    });

    // Restore transitions and animations
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.style.transition = '';
      el.style.animation = '';
    });
  }

  /**
   * Flatten tree data for CSV export
   */
  flattenTreeData(node, level = 0, parentPath = '') {
    const flatData = [];

    const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;

    flatData.push({
      name: node.name,
      level: level,
      path: currentPath,
      address: node.attributes?.address || node.id || '',
      earnings: node.attributes?.earnings || node.earnings || '$0.00',
      withdrawable: node.attributes?.withdrawable || '$0.00',
      package: node.attributes?.package || node.package || 'N/A',
      directReferrals:
        node.attributes?.directReferrals || node.directReferrals || 0,
      totalNetwork: node.attributes?.totalNetwork || node.totalNetwork || 0,
      isCapped: node.attributes?.isCapped || false,
      isUser: node.attributes?.isUser || false,
    });

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        flatData.push(...this.flattenTreeData(child, level + 1, currentPath));
      });
    }

    return flatData;
  }

  /**
   * Convert array of objects to CSV string
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Get export statistics
   */
  getExportStats(treeData) {
    if (!treeData) return null;

    const stats = {
      totalNodes: 0,
      maxDepth: 0,
      totalEarnings: 0,
      activeUsers: 0,
      cappedUsers: 0,
    };

    const traverse = (node, depth = 0) => {
      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      const earnings = parseFloat(
        (node.attributes?.earnings || node.earnings || '$0').replace(
          /[$,]/g,
          ''
        )
      );
      if (!isNaN(earnings)) {
        stats.totalEarnings += earnings;
      }

      if (node.attributes?.isCapped) {
        stats.cappedUsers++;
      } else {
        stats.activeUsers++;
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, depth + 1));
      }
    };

    traverse(treeData);
    return stats;
  }
}

// Export singleton instance
export default new TreeExporter();
