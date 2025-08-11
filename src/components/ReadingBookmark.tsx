import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../context/AlertContext';

const { width, height } = Dimensions.get('window');

interface Bookmark {
  id: string;
  page: number;
  title: string;
  note?: string;
  timestamp: Date;
}

interface ReadingBookmarkProps {
  currentPage: number;
  totalPages: number;
  bookmarks: Bookmark[];
  onAddBookmark: (page: number, title: string, note?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onGoToBookmark: (page: number) => void;
  theme: 'dark' | 'sepia' | 'light';
}

const ReadingBookmark: React.FC<ReadingBookmarkProps> = ({
  currentPage,
  totalPages,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  onGoToBookmark,
  theme,
}) => {
  const { showSuccess, showError } = useAlert();
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');

  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          background: '#ffffff',
          text: '#000000',
          secondaryText: '#666666',
          accent: '#f59e0b',
          border: '#e0e0e0',
        };
      case 'sepia':
        return {
          background: '#f4ecd8',
          text: '#5c4b37',
          secondaryText: '#8b7355',
          accent: '#d4a574',
          border: '#d4c4a8',
        };
      default: // dark
        return {
          background: '#0a0a0a',
          text: '#ffffff',
          secondaryText: '#a3a3a3',
          accent: '#f59e0b',
          border: '#2a2a2a',
        };
    }
  };

  const themeColors = getThemeColors();

  const handleAddBookmark = () => {
    if (!bookmarkTitle.trim()) {
      showError('Error', 'Please enter a bookmark title');
      return;
    }

    onAddBookmark(currentPage, bookmarkTitle.trim(), bookmarkNote.trim() || undefined);
    setBookmarkTitle('');
    setBookmarkNote('');
    setShowBookmarkModal(false);
    showSuccess('Bookmark Added', `Bookmark added for page ${currentPage}`);
  };

  const handleRemoveBookmark = (id: string) => {
    onRemoveBookmark(id);
    showSuccess('Bookmark Removed', 'Bookmark has been removed');
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.container}>
      {/* Quick Add Bookmark Button */}
      <TouchableOpacity
        style={[styles.quickAddButton, { backgroundColor: themeColors.accent }]}
        onPress={() => setShowBookmarkModal(true)}
      >
        <Ionicons name="bookmark-outline" size={20} color="#ffffff" />
        <Text style={styles.quickAddText}>Add Bookmark</Text>
      </TouchableOpacity>

      {/* Bookmarks List */}
      {bookmarks.length > 0 && (
        <View style={[styles.bookmarksContainer, { backgroundColor: themeColors.background }]}>
          <Text style={[styles.bookmarksTitle, { color: themeColors.text }]}>
            Bookmarks ({bookmarks.length})
          </Text>
          
          {bookmarks.map((bookmark) => (
            <View 
              key={bookmark.id} 
              style={[
                styles.bookmarkItem,
                { 
                  borderBottomColor: themeColors.border,
                  backgroundColor: bookmark.page === currentPage ? `${themeColors.accent}20` : 'transparent'
                }
              ]}
            >
              <View style={styles.bookmarkHeader}>
                <Text style={[styles.bookmarkTitle, { color: themeColors.text }]}>
                  {bookmark.title}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveBookmark(bookmark.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close" size={16} color={themeColors.secondaryText} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.bookmarkPage, { color: themeColors.accent }]}>
                Page {bookmark.page} of {totalPages}
              </Text>
              
              {bookmark.note && (
                <Text style={[styles.bookmarkNote, { color: themeColors.secondaryText }]}>
                  {bookmark.note}
                </Text>
              )}
              
              <Text style={[styles.bookmarkTimestamp, { color: themeColors.secondaryText }]}>
                {formatTimestamp(bookmark.timestamp)}
              </Text>
              
              <TouchableOpacity
                style={[styles.goToButton, { borderColor: themeColors.accent }]}
                onPress={() => onGoToBookmark(bookmark.page)}
              >
                <Text style={[styles.goToButtonText, { color: themeColors.accent }]}>
                  Go to Page
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Bookmark Modal */}
      <Modal
        visible={showBookmarkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookmarkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                Add Bookmark
              </Text>
              <TouchableOpacity onPress={() => setShowBookmarkModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: themeColors.text }]}>
                Page {currentPage} of {totalPages}
              </Text>
              
              <Text style={[styles.modalLabel, { color: themeColors.text }]}>
                Title *
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  color: themeColors.text,
                  borderColor: themeColors.border,
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
                }]}
                placeholder="Enter bookmark title"
                placeholderTextColor={themeColors.secondaryText}
                value={bookmarkTitle}
                onChangeText={setBookmarkTitle}
                autoFocus
              />
              
              <Text style={[styles.modalLabel, { color: themeColors.text }]}>
                Note (optional)
              </Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea, { 
                  color: themeColors.text,
                  borderColor: themeColors.border,
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
                }]}
                placeholder="Add a note about this bookmark"
                placeholderTextColor={themeColors.secondaryText}
                value={bookmarkNote}
                onChangeText={setBookmarkNote}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: themeColors.border }]}
                onPress={() => setShowBookmarkModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: themeColors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: themeColors.accent }]}
                onPress={handleAddBookmark}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                  Save Bookmark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  quickAddText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  bookmarksContainer: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookmarksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bookmarkItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookmarkTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  bookmarkPage: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookmarkNote: {
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  bookmarkTimestamp: {
    fontSize: 10,
    marginBottom: 8,
  },
  goToButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  goToButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReadingBookmark; 