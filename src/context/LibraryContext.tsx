import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadManager, DownloadedMagazine, DownloadProgress, LibraryStats } from '../services/downloadManager';
import { Magazine } from '../services/api';
import { useSafeToast } from '../hooks/useSafeToast';

interface LibraryContextType {
  // Downloaded magazines
  downloadedMagazines: DownloadedMagazine[];
  isDownloaded: (magazineId: string) => boolean;
  downloadMagazine: (magazine: Magazine, onProgress?: (progress: DownloadProgress) => void) => Promise<void>;
  removeDownloadedMagazine: (magazineId: string) => Promise<void>;
  getDownloadedMagazine: (magazineId: string) => Promise<DownloadedMagazine | null>;
  
  // Bookmarked magazines
  bookmarkedMagazines: Magazine[];
  isBookmarked: (magazineId: string) => boolean;
  toggleBookmark: (magazine: Magazine) => Promise<void>;
  removeBookmark: (magazine: Magazine) => Promise<void>;
  
  // Library stats
  libraryStats: LibraryStats;
  refreshLibraryStats: () => void;
  
  // Download progress
  downloadProgress: Map<string, DownloadProgress>;
  
  // Loading states
  isLoading: boolean;
  isDownloading: (magazineId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

interface LibraryProviderProps {
  children: ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const { showToast } = useSafeToast();
  
  const [downloadedMagazines, setDownloadedMagazines] = useState<DownloadedMagazine[]>([]);
  const [bookmarkedMagazines, setBookmarkedMagazines] = useState<Magazine[]>([]);
  const [libraryStats, setLibraryStats] = useState<LibraryStats>({
    totalDownloaded: 0,
    totalSize: 0,
    totalReadTime: 0,
    averageProgress: 0,
  });
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      
      // Load downloaded magazines
      const magazines = downloadManager.getAllDownloadedMagazines();
      setDownloadedMagazines(magazines);
      
      // Load bookmarked magazines
      await loadBookmarkedMagazines();
      
      // Refresh library stats
      refreshLibraryStats();
      
    } catch (error) {
      console.error('Failed to load library data:', error);
      showToast('Failed to load library data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookmarkedMagazines = async () => {
    try {
      const bookmarkedData = await AsyncStorage.getItem('bookmarked_magazines');
      if (bookmarkedData) {
        const bookmarked = JSON.parse(bookmarkedData);
        setBookmarkedMagazines(bookmarked);
      }
    } catch (error) {
      console.error('Failed to load bookmarked magazines:', error);
    }
  };

  const downloadMagazine = async (magazine: Magazine, onProgress?: (progress: DownloadProgress) => void) => {
    try {
      const progressHandler = (progress: DownloadProgress) => {
        setDownloadProgress(prev => new Map(prev).set(progress.magazineId, progress));
        onProgress?.(progress);
      };

      await downloadManager.downloadMagazine(magazine, progressHandler);
      
      // Refresh downloaded magazines
      const magazines = downloadManager.getAllDownloadedMagazines();
      setDownloadedMagazines(magazines);
      
      // Update stats
      refreshLibraryStats();
      
      // Clear progress
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(magazine._id);
        return newMap;
      });
      
      showToast(`${magazine.name} has been downloaded successfully!`, 'success');
      
    } catch (error) {
      console.error('Error downloading magazine:', error);
      showToast(error instanceof Error ? error.message : 'Failed to download magazine', 'error');
      
      // Clear progress on error
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(magazine._id);
        return newMap;
      });
    }
  };

  const removeDownloadedMagazine = async (magazineId: string) => {
    try {
      const success = await downloadManager.removeDownloadedMagazine(magazineId);
      
      if (success) {
        // Refresh downloaded magazines
        const magazines = downloadManager.getAllDownloadedMagazines();
        setDownloadedMagazines(magazines);
        
        // Update stats
        refreshLibraryStats();
        
        showToast('Magazine removed from downloads', 'success');
      } else {
        showToast('Failed to remove magazine', 'error');
      }
    } catch (error) {
      console.error('Error removing downloaded magazine:', error);
      showToast('Failed to remove magazine', 'error');
    }
  };

  const getDownloadedMagazine = async (magazineId: string) => {
    return await downloadManager.getDownloadedMagazine(magazineId);
  };

  const isDownloaded = (magazineId: string) => {
    return downloadManager.isDownloaded(magazineId);
  };

  const isBookmarked = (magazineId: string) => {
    return bookmarkedMagazines.some(mag => mag._id === magazineId);
  };

  const toggleBookmark = async (magazine: Magazine) => {
    try {
      if (isBookmarked(magazine._id)) {
        await removeBookmark(magazine);
      } else {
        const updatedBookmarks = [...bookmarkedMagazines, magazine];
        setBookmarkedMagazines(updatedBookmarks);
        await AsyncStorage.setItem('bookmarked_magazines', JSON.stringify(updatedBookmarks));
        showToast('Magazine added to bookmarks', 'success');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      showToast('Failed to update bookmark', 'error');
    }
  };

  const removeBookmark = async (magazine: Magazine) => {
    try {
      const updatedBookmarks = bookmarkedMagazines.filter(b => b._id !== magazine._id);
      setBookmarkedMagazines(updatedBookmarks);
      await AsyncStorage.setItem('bookmarked_magazines', JSON.stringify(updatedBookmarks));
      showToast('Magazine removed from bookmarks', 'success');
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      showToast('Failed to remove bookmark', 'error');
    }
  };

  const refreshLibraryStats = () => {
    const stats: LibraryStats = {
      totalDownloaded: downloadedMagazines.length,
      totalSize: downloadedMagazines.reduce((sum, mag) => sum + (mag.fileSize || 0), 0),
      totalReadTime: 0, // No reading functionality
      averageProgress: 0, // No reading functionality
    };
    setLibraryStats(stats);
  };

  const isDownloading = (magazineId: string) => {
    return downloadProgress.has(magazineId);
  };

  const value: LibraryContextType = {
    downloadedMagazines,
    isDownloaded,
    downloadMagazine,
    removeDownloadedMagazine,
    getDownloadedMagazine,
    bookmarkedMagazines,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    libraryStats,
    refreshLibraryStats,
    downloadProgress,
    isLoading,
    isDownloading,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}; 