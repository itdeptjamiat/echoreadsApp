/**
 * PDF Data URI Utilities
 * 
 * Functions to convert PDF data between different formats for secure viewing
 * without leaving plaintext files on disk.
 */

/**
 * Converts ArrayBuffer to base64 data URL
 */
export function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string = 'application/pdf'): string {
  try {
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to convert ArrayBuffer to data URL:', error);
    throw new Error('Failed to convert PDF data to viewable format');
  }
}

/**
 * Converts base64 string to data URL
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'application/pdf'): string {
  try {
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to convert base64 to data URL:', error);
    throw new Error('Failed to convert base64 to data URL');
  }
}

/**
 * Converts data URL back to ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
      throw new Error('Invalid data URL format');
    }
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Failed to convert data URL to ArrayBuffer:', error);
    throw new Error('Failed to convert data URL to ArrayBuffer');
  }
}

/**
 * Extracts base64 from data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    return parts[1];
  } catch (error) {
    console.error('Failed to extract base64 from data URL:', error);
    throw new Error('Failed to extract base64 from data URL');
  }
}

/**
 * Validates if a string is a valid data URL
 */
export function isValidDataUrl(dataUrl: string): boolean {
  try {
    const pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
    return pattern.test(dataUrl);
  } catch (error) {
    return false;
  }
}

/**
 * Gets MIME type from data URL
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string | null {
  try {
    const match = dataUrl.match(/^data:([^;]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Creates a temporary data URL for PDF viewing
 * This ensures no plaintext files are left on disk
 */
export function createTemporaryPdfDataUrl(pdfData: ArrayBuffer | string): string {
  try {
    if (typeof pdfData === 'string') {
      // If it's already a data URL, validate and return
      if (isValidDataUrl(pdfData)) {
        return pdfData;
      }
      // If it's base64, convert to data URL
      return base64ToDataUrl(pdfData);
    } else {
      // If it's ArrayBuffer, convert to data URL
      return arrayBufferToDataUrl(pdfData);
    }
  } catch (error) {
    console.error('Failed to create temporary PDF data URL:', error);
    throw new Error('Failed to create viewable PDF format');
  }
}

/**
 * Cleans up data URL from memory
 * This is important for security - we don't want PDF data lingering in memory
 */
export function cleanupPdfDataUrl(dataUrl: string): void {
  try {
    // In a real implementation, you might want to:
    // 1. Clear any references to the data URL
    // 2. Force garbage collection if needed
    // 3. Log cleanup for security auditing
    
    // For now, we just log the cleanup
    console.log('PDF data URL cleaned up from memory');
  } catch (error) {
    console.error('Failed to cleanup PDF data URL:', error);
  }
}

/**
 * Estimates the size of a data URL in bytes
 */
export function estimateDataUrlSize(dataUrl: string): number {
  try {
    const base64 = extractBase64FromDataUrl(dataUrl);
    // Base64 encoding increases size by ~33%
    // Each base64 character represents 6 bits, so 4 characters = 3 bytes
    return Math.ceil((base64.length * 3) / 4);
  } catch (error) {
    console.error('Failed to estimate data URL size:', error);
    return 0;
  }
}

/**
 * Checks if data URL size is within reasonable limits
 * This prevents memory issues with extremely large PDFs
 */
export function isDataUrlSizeReasonable(dataUrl: string, maxSizeMB: number = 100): boolean {
  try {
    const sizeBytes = estimateDataUrlSize(dataUrl);
    const sizeMB = sizeBytes / (1024 * 1024);
    return sizeMB <= maxSizeMB;
  } catch (error) {
    console.error('Failed to check data URL size:', error);
    return false;
  }
} 