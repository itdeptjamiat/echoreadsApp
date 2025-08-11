import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadManager, DownloadedMagazine, DownloadProgress, LibraryStats } from '../services/downloadManager';
import { Magazine } from '../services/api';
import { useAlert } from './AlertContext';

interface ReadingList {
  id: string;
  name: string;
  description?: string;
  magazineIds: string[];
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  removeBookmark: (magazineId: string) => Promise<void>;
  
  // Reading lists
  readingLists: ReadingList[];
  createReadingList: (name: string, description?: string, color?: string, icon?: string) => Promise<void>;
  updateReadingList: (id: string, updates: Partial<ReadingList>) => Promise<void>;
  deleteReadingList: (id: string) => Promise<void>;
  addToReadingList: (listId: string, magazineId: string) => Promise<void>;
  removeFromReadingList: (listId: string, magazineId: string) => Promise<void>;
  
  // Reading progress
  updateReadProgress: (magazineId: string, progress: number) => Promise<void>;
  
  // Page bookmarks
  addPageBookmark: (magazineId: string, page: number, title: string, note?: string) => Promise<void>;
  removePageBookmark: (magazineId: string, bookmarkId: string) => Promise<void>;
  
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
  const { showSuccess, showError } = useAlert();
  
  const [downloadedMagazines, setDownloadedMagazines] = useState<DownloadedMagazine[]>([]);
  const [bookmarkedMagazines, setBookmarkedMagazines] = useState<Magazine[]>([]);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
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
      
      // Load reading lists from storage
      await loadReadingLists();
      
      // Update library stats
      refreshLibraryStats();
      
    } catch (error) {
      console.error('Error loading library data:', error);
      showError('Error', 'Failed to load library data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadingLists = async () => {
    try {
      // In a real app, load from AsyncStorage or API
      const defaultLists: ReadingList[] = [
        {
          id: '1',
          name: 'Tech Deep Dive',
          description: 'Latest technology insights and trends',
          magazineIds: [],
          color: '#f59e0b',
          icon: 'laptop-outline',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Business Strategy',
          description: 'Business insights and strategic thinking',
          magazineIds: [],
          color: '#10b981',
          icon: 'briefcase-outline',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Science & Research',
          description: 'Scientific discoveries and research papers',
          magazineIds: [],
          color: '#3b82f6',
          icon: 'flask-outline',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      setReadingLists(defaultLists);
    } catch (error) {
      console.error('Error loading reading lists:', error);
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
      
      showSuccess('Download Complete', `${magazine.name} has been downloaded successfully!`);
      
    } catch (error) {
      console.error('Error downloading magazine:', error);
      showError('Download Failed', error instanceof Error ? error.message : 'Failed to download magazine');
      
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
        
        showSuccess('Removed', 'Magazine removed from downloads');
      } else {
        showError('Error', 'Failed to remove magazine');
      }
    } catch (error) {
      console.error('Error removing downloaded magazine:', error);
      showError('Error', 'Failed to remove magazine');
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
      const isCurrentlyBookmarked = isBookmarked(magazine._id);
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        setBookmarkedMagazines(prev => prev.filter(mag => mag._id !== magazine._id));
        showSuccess('Bookmark Removed', 'Removed from your bookmarks');
      } else {
        // Add bookmark
        setBookmarkedMagazines(prev => [...prev, magazine]);
        showSuccess('Bookmark Added', 'Added to your bookmarks');
      }
      
      // Save to storage
      await AsyncStorage.setItem('bookmarkedMagazines', JSON.stringify(bookmarkedMagazines));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showError('Error', 'Failed to update bookmark');
    }
  };

  const removeBookmark = async (magazineId: string) => {
    try {
      setBookmarkedMagazines(prev => prev.filter(mag => mag._id !== magazineId));
      await AsyncStorage.setItem('bookmarkedMagazines', JSON.stringify(bookmarkedMagazines));
      showSuccess('Bookmark Removed', 'Removed from your bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showError('Error', 'Failed to remove bookmark');
    }
  };

  const createReadingList = async (name: string, description?: string, color = '#f59e0b', icon = 'bookmark-outline') => {
    try {
      const newList: ReadingList = {
        id: `list_${Date.now()}`,
        name,
        description,
        magazineIds: [],
        color,
        icon,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setReadingLists(prev => [...prev, newList]);
      showSuccess('List Created', `Reading list "${name}" created successfully!`);
    } catch (error) {
      console.error('Error creating reading list:', error);
      showError('Error', 'Failed to create reading list');
    }
  };

  const updateReadingList = async (id: string, updates: Partial<ReadingList>) => {
    try {
      setReadingLists(prev => 
        prev.map(list => 
          list.id === id 
            ? { ...list, ...updates, updatedAt: new Date() }
            : list
        )
      );
      showSuccess('Updated', 'Reading list updated successfully!');
    } catch (error) {
      console.error('Error updating reading list:', error);
      showError('Error', 'Failed to update reading list');
    }
  };

  const deleteReadingList = async (id: string) => {
    try {
      setReadingLists(prev => prev.filter(list => list.id !== id));
      showSuccess('Deleted', 'Reading list deleted successfully!');
    } catch (error) {
      console.error('Error deleting reading list:', error);
      showError('Error', 'Failed to delete reading list');
    }
  };

  const addToReadingList = async (listId: string, magazineId: string) => {
    try {
      setReadingLists(prev => 
        prev.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                magazineIds: [...list.magazineIds, magazineId],
                updatedAt: new Date() 
              }
            : list
        )
      );
      showSuccess('Added', 'Magazine added to reading list!');
    } catch (error) {
      console.error('Error adding to reading list:', error);
      showError('Error', 'Failed to add magazine to reading list');
    }
  };

  const removeFromReadingList = async (listId: string, magazineId: string) => {
    try {
      setReadingLists(prev => 
        prev.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                magazineIds: list.magazineIds.filter(id => id !== magazineId),
                updatedAt: new Date() 
              }
            : list
        )
      );
      showSuccess('Removed', 'Magazine removed from reading list!');
    } catch (error) {
      console.error('Error removing from reading list:', error);
      showError('Error', 'Failed to remove magazine from reading list');
    }
  };

  const updateReadProgress = async (magazineId: string, progress: number) => {
    try {
      await downloadManager.updateReadProgress(magazineId, progress);
      
      // Update local state
      setDownloadedMagazines(prev => 
        prev.map(mag => 
          mag.id === magazineId 
            ? { ...mag, readProgress: progress, lastReadDate: new Date() }
            : mag
        )
      );
      
      // Update stats
      refreshLibraryStats();
    } catch (error) {
      console.error('Error updating read progress:', error);
    }
  };

  const addPageBookmark = async (magazineId: string, page: number, title: string, note?: string) => {
    try {
      await downloadManager.addBookmark(magazineId, { page, title, note, timestamp: new Date() });
      
      // Update local state
      setDownloadedMagazines(prev => 
        prev.map(mag => 
          mag.id === magazineId 
            ? { 
                ...mag, 
                bookmarks: [
                  ...mag.bookmarks,
                  {
                    id: `${magazineId}_${Date.now()}`,
                    page,
                    title,
                    note,
                    timestamp: new Date()
                  }
                ]
              }
            : mag
        )
      );
    } catch (error) {
      console.error('Error adding bookmark:', error);
      showError('Error', 'Failed to add bookmark');
    }
  };

  const removePageBookmark = async (magazineId: string, bookmarkId: string) => {
    try {
      await downloadManager.removeBookmark(magazineId, bookmarkId);
      
      // Update local state
      setDownloadedMagazines(prev => 
        prev.map(mag => 
          mag.id === magazineId 
            ? { 
                ...mag, 
                bookmarks: mag.bookmarks.filter(b => b.id !== bookmarkId)
              }
            : mag
        )
      );
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showError('Error', 'Failed to remove bookmark');
    }
  };

  const refreshLibraryStats = () => {
    const stats = downloadManager.getLibraryStats();
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
    readingLists,
    createReadingList,
    updateReadingList,
    deleteReadingList,
    addToReadingList,
    removeFromReadingList,
    updateReadProgress,
    addPageBookmark,
    removePageBookmark,
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