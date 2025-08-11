import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Magazine } from './api';

export interface DownloadedMagazine {
  id: string;
  magazineData: Magazine;
  downloadDate: Date;
  filePath: string;
  fileSize: number;
  lastReadDate?: Date;
  readProgress: number;
  isOffline: boolean;
  content?: string;
  bookmarks: Bookmark[];
}

export interface Bookmark {
  id: string;
  page: number;
  title: string;
  note?: string;
  timestamp: Date;
}

export interface DownloadProgress {
  magazineId: string;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
}

export interface LibraryStats {
  totalDownloaded: number;
  totalSize: number;
  totalReadTime: number;
  averageProgress: number;
  lastDownloadDate?: Date;
}

class DownloadManager {
  private downloads: Map<string, DownloadedMagazine> = new Map();
  private downloadProgress: Map<string, DownloadProgress> = new Map();
  private storageKey = 'echoreads_downloaded_magazines';
  private progressKey = 'echoreads_download_progress';

  constructor() {
    this.loadDownloadedMagazines();
  }

  // Load downloaded magazines from storage
  private async loadDownloadedMagazines() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const magazines = JSON.parse(stored);
        this.downloads.clear();
        magazines.forEach((mag: DownloadedMagazine) => {
          this.downloads.set(mag.id, {
            ...mag,
            downloadDate: new Date(mag.downloadDate),
            lastReadDate: mag.lastReadDate ? new Date(mag.lastReadDate) : undefined,
          });
        });
      }
    } catch (error) {
      console.error('Error loading downloaded magazines:', error);
    }
  }

  // Save downloaded magazines to storage
  private async saveDownloadedMagazines() {
    try {
      const magazines = Array.from(this.downloads.values());
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(magazines));
    } catch (error) {
      console.error('Error saving downloaded magazines:', error);
    }
  }

  // Get download directory
  private getDownloadDirectory(): string {
    const baseDir = FileSystem.documentDirectory;
    const downloadDir = `${baseDir}downloads/`;
    return downloadDir;
  }

  // Ensure download directory exists
  private async ensureDownloadDirectory(): Promise<string> {
    const downloadDir = this.getDownloadDirectory();
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }
    
    return downloadDir;
  }

  // Download magazine
  async downloadMagazine(magazine: Magazine, onProgress?: (progress: DownloadProgress) => void): Promise<DownloadedMagazine> {
    const magazineId = magazine._id;
    
    // Check if already downloaded
    if (this.downloads.has(magazineId)) {
      throw new Error('Magazine already downloaded');
    }

    // Initialize download progress
    const progress: DownloadProgress = {
      magazineId,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      status: 'downloading'
    };
    
    this.downloadProgress.set(magazineId, progress);
    onProgress?.(progress);

    try {
      // Ensure download directory exists
      const downloadDir = await this.ensureDownloadDirectory();
      const fileName = `${magazineId}_${Date.now()}.json`;
      const filePath = `${downloadDir}${fileName}`;

      // Create magazine content (in real app, this would be fetched from API)
      const magazineContent = this.generateMagazineContent(magazine);
      
      // Simulate download progress
      const totalBytes = magazineContent.length;
      progress.totalBytes = totalBytes;
      
      // Simulate chunked download
      const chunkSize = 1024; // 1KB chunks
      let downloadedBytes = 0;
      
      for (let i = 0; i < totalBytes; i += chunkSize) {
        const chunk = magazineContent.slice(i, i + chunkSize);
        downloadedBytes += chunk.length;
        
        progress.downloadedBytes = downloadedBytes;
        progress.progress = (downloadedBytes / totalBytes) * 100;
        
        this.downloadProgress.set(magazineId, progress);
        onProgress?.(progress);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Save magazine data
      const downloadedMagazine: DownloadedMagazine = {
        id: magazineId,
        magazineData: magazine,
        downloadDate: new Date(),
        filePath,
        fileSize: totalBytes,
        readProgress: 0,
        isOffline: true,
        content: magazineContent,
        bookmarks: []
      };

      // Save to file system
      await FileSystem.writeAsStringAsync(filePath, magazineContent);
      
      // Add to downloads
      this.downloads.set(magazineId, downloadedMagazine);
      await this.saveDownloadedMagazines();

      // Update progress
      progress.status = 'completed';
      progress.progress = 100;
      this.downloadProgress.set(magazineId, progress);
      onProgress?.(progress);

      return downloadedMagazine;

    } catch (error) {
      progress.status = 'failed';
      this.downloadProgress.set(magazineId, progress);
      onProgress?.(progress);
      throw error;
    }
  }

  // Generate magazine content (simulated)
  private generateMagazineContent(magazine: Magazine): string {
    return JSON.stringify({
      id: magazine._id,
      title: magazine.name,
      category: magazine.category,
      content: `# ${magazine.name}

## Introduction

Welcome to ${magazine.name}, a comprehensive exploration of ${magazine.category.toLowerCase()}. This magazine brings you the latest insights, trends, and developments in this fascinating field.

## Chapter 1: Getting Started

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Chapter 2: Deep Dive

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Chapter 3: Advanced Concepts

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

## Chapter 4: Practical Applications

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Chapter 5: Conclusion

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

This concludes our journey through ${magazine.name}. We hope you've found this exploration both informative and engaging.`,
      metadata: {
        author: 'EchoReads Team',
        publishDate: new Date().toISOString(),
        wordCount: 250,
        estimatedReadTime: 5
      }
    });
  }

  // Get downloaded magazine
  async getDownloadedMagazine(magazineId: string): Promise<DownloadedMagazine | null> {
    const magazine = this.downloads.get(magazineId);
    if (!magazine) return null;

    // Verify file still exists
    const fileInfo = await FileSystem.getInfoAsync(magazine.filePath);
    if (!fileInfo.exists) {
      // File was deleted, remove from downloads
      this.downloads.delete(magazineId);
      await this.saveDownloadedMagazines();
      return null;
    }

    return magazine;
  }

  // Get all downloaded magazines
  getAllDownloadedMagazines(): DownloadedMagazine[] {
    return Array.from(this.downloads.values());
  }

  // Remove downloaded magazine
  async removeDownloadedMagazine(magazineId: string): Promise<boolean> {
    const magazine = this.downloads.get(magazineId);
    if (!magazine) return false;

    try {
      // Delete file
      await FileSystem.deleteAsync(magazine.filePath);
      
      // Remove from downloads
      this.downloads.delete(magazineId);
      await this.saveDownloadedMagazines();
      
      return true;
    } catch (error) {
      console.error('Error removing downloaded magazine:', error);
      return false;
    }
  }

  // Update read progress
  async updateReadProgress(magazineId: string, progress: number): Promise<void> {
    const magazine = this.downloads.get(magazineId);
    if (!magazine) return;

    magazine.readProgress = progress;
    magazine.lastReadDate = new Date();
    await this.saveDownloadedMagazines();
  }

  // Add bookmark
  async addBookmark(magazineId: string, bookmark: Omit<Bookmark, 'id'>): Promise<void> {
    const magazine = this.downloads.get(magazineId);
    if (!magazine) return;

    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${magazineId}_${Date.now()}`,
      timestamp: new Date()
    };

    magazine.bookmarks.push(newBookmark);
    await this.saveDownloadedMagazines();
  }

  // Remove bookmark
  async removeBookmark(magazineId: string, bookmarkId: string): Promise<void> {
    const magazine = this.downloads.get(magazineId);
    if (!magazine) return;

    magazine.bookmarks = magazine.bookmarks.filter(b => b.id !== bookmarkId);
    await this.saveDownloadedMagazines();
  }

  // Get download progress
  getDownloadProgress(magazineId: string): DownloadProgress | null {
    return this.downloadProgress.get(magazineId) || null;
  }

  // Get library statistics
  getLibraryStats(): LibraryStats {
    const magazines = Array.from(this.downloads.values());
    
    const totalDownloaded = magazines.length;
    const totalSize = magazines.reduce((sum, mag) => sum + mag.fileSize, 0);
    const totalReadTime = magazines.reduce((sum, mag) => sum + (mag.readProgress || 0), 0);
    const averageProgress = totalDownloaded > 0 ? totalReadTime / totalDownloaded : 0;
    
    const lastDownloadDate = magazines.length > 0 
      ? new Date(Math.max(...magazines.map(m => m.downloadDate.getTime())))
      : undefined;

    return {
      totalDownloaded,
      totalSize,
      totalReadTime: Math.round(totalReadTime),
      averageProgress: Math.round(averageProgress),
      lastDownloadDate
    };
  }

  // Check if magazine is downloaded
  isDownloaded(magazineId: string): boolean {
    return this.downloads.has(magazineId);
  }

  // Get available storage space
  async getAvailableStorage(): Promise<number> {
    try {
      const downloadDir = this.getDownloadDirectory();
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      
      if (dirInfo.exists) {
        // In a real app, you'd calculate actual available space
        // For now, return a simulated value
        return 1024 * 1024 * 1024; // 1GB
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting available storage:', error);
      return 0;
    }
  }

  // Clear all downloads
  async clearAllDownloads(): Promise<void> {
    try {
      const downloadDir = this.getDownloadDirectory();
      await FileSystem.deleteAsync(downloadDir, { idempotent: true });
      
      this.downloads.clear();
      this.downloadProgress.clear();
      await this.saveDownloadedMagazines();
    } catch (error) {
      console.error('Error clearing downloads:', error);
    }
  }
}

// Export singleton instance
export const downloadManager = new DownloadManager(); 