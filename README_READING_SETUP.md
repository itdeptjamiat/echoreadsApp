# Reading Page Setup Guide - EchoReads

## 📚 Overview

The reading page in EchoReads provides a modern, feature-rich reading experience with customizable themes, progress tracking, bookmarks, and beautiful typography. This guide covers how to set up and use the reading functionality.

## 🚀 Features

### Core Reading Features
- **Multi-theme Support**: Dark, Sepia, and Light themes
- **Font Size Control**: Adjustable text size (12-24px)
- **Progress Tracking**: Page and word count progress
- **Bookmarks**: Add, manage, and navigate to bookmarks
- **Reading Statistics**: Time tracking, reading speed, and completion percentage
- **Auto-hide Controls**: Clean reading experience with auto-hiding UI

### UI/UX Features
- **Smooth Animations**: Beautiful transitions and interactions
- **Responsive Design**: Adapts to different screen sizes
- **Gesture Support**: Tap to show/hide controls
- **Status Bar Integration**: Theme-aware status bar colors
- **Beautiful Typography**: Optimized for readability

## 🏗️ Architecture

### File Structure
```
src/
├── screens/
│   └── ReadingScreen.tsx          # Main reading screen
├── components/
│   ├── ReadingProgress.tsx        # Progress tracking component
│   └── ReadingBookmark.tsx        # Bookmark management component
└── context/
    └── AlertContext.tsx           # Global alert system
```

### Navigation Flow
```
MagazineDetailScreen → ReadingScreen
```

## 📱 Setup Instructions

### 1. Navigation Configuration

The reading screen is already integrated into the navigation stack:

```typescript
// App.tsx
export type RootStackParamList = {
  // ... other routes
  Reading: { 
    magazineId: string; 
    magazineData: Magazine;
    content?: string;
  };
};

// Add to navigator
<Stack.Screen name="Reading" component={ReadingScreen} />
```

### 2. Navigation from Magazine Detail

Update the "Read" button in MagazineDetailScreen:

```typescript
const handleRead = async () => {
  setReading(true);
  try {
    navigation.navigate('Reading', {
      magazineId,
      magazineData: magazine!,
    });
  } catch (error) {
    showBeautifulAlert('Error', 'Failed to open magazine', 'error');
  } finally {
    setReading(false);
  }
};
```

### 3. Content Integration

The reading screen accepts content through navigation params:

```typescript
// Navigate with content
navigation.navigate('Reading', {
  magazineId: 'magazine-123',
  magazineData: magazineData,
  content: 'Your magazine content here...'
});
```

## 🎨 Customization

### Theme Configuration

The reading screen supports three themes:

```typescript
type Theme = 'dark' | 'sepia' | 'light';

// Theme colors are automatically applied
const themeColors = getThemeColors();
```

### Font Size Control

Users can adjust font size from 12px to 24px:

```typescript
const [fontSize, setFontSize] = useState(16);
const [lineHeight, setLineHeight] = useState(24);

const changeFontSize = (increment: number) => {
  const newSize = Math.max(12, Math.min(24, fontSize + increment));
  setFontSize(newSize);
  setLineHeight(newSize * 1.5);
};
```

### Content Formatting

The reading screen automatically formats content:

```typescript
// Markdown-style formatting
# Heading 1
## Heading 2
Regular paragraph text
```

## 📊 Progress Tracking

### Reading Statistics

The reading screen tracks various metrics:

- **Current Page**: Current page number
- **Total Pages**: Total number of pages
- **Reading Time**: Time spent reading
- **Words Read**: Number of words read
- **Reading Speed**: Words per minute

### Progress Persistence

```typescript
// Save progress to storage
const saveReadingProgress = async () => {
  const progress = (currentPage / totalPages) * 100;
  setReadingProgress(progress);
  // Save to AsyncStorage or API
};

// Load progress on mount
useEffect(() => {
  loadReadingProgress();
}, []);
```

## 🔖 Bookmark System

### Adding Bookmarks

```typescript
const handleAddBookmark = (page: number, title: string, note?: string) => {
  const bookmark = {
    id: generateId(),
    page,
    title,
    note,
    timestamp: new Date(),
  };
  setBookmarks([...bookmarks, bookmark]);
};
```

### Bookmark Management

```typescript
// Remove bookmark
const handleRemoveBookmark = (id: string) => {
  setBookmarks(bookmarks.filter(b => b.id !== id));
};

// Navigate to bookmark
const handleGoToBookmark = (page: number) => {
  setCurrentPage(page);
  // Scroll to page
};
```

## 🎯 Usage Examples

### Basic Reading Screen

```typescript
// Navigate to reading screen
navigation.navigate('Reading', {
  magazineId: 'magazine-123',
  magazineData: {
    _id: 'magazine-123',
    name: 'Sample Magazine',
    category: 'Technology',
    // ... other magazine data
  },
  content: '# Sample Content\n\nThis is sample content...'
});
```

### Custom Content Integration

```typescript
// Load content from API
const loadMagazineContent = async (magazineId: string) => {
  try {
    const response = await magazinesAPI.getMagazineContent(magazineId);
    navigation.navigate('Reading', {
      magazineId,
      magazineData: magazineData,
      content: response.content
    });
  } catch (error) {
    showError('Error', 'Failed to load magazine content');
  }
};
```

### Progress Tracking Integration

```typescript
// Track reading progress
const trackReadingProgress = () => {
  const progress = (currentPage / totalPages) * 100;
  
  // Save to API
  magazinesAPI.updateReadingProgress(magazineId, {
    currentPage,
    totalPages,
    progress,
    readingTime: Date.now() - startTime
  });
};
```

## 🔧 Advanced Configuration

### Custom Themes

Add custom themes by extending the theme system:

```typescript
const getThemeColors = () => {
  switch (theme) {
    case 'custom':
      return {
        background: '#your-color',
        text: '#your-color',
        secondaryText: '#your-color',
        accent: '#your-color',
        border: '#your-color',
      };
    // ... existing themes
  }
};
```

### Content Parsing

Customize content parsing for different formats:

```typescript
const parseContent = (content: string) => {
  // Custom parsing logic
  return content
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) {
        return { type: 'heading1', content: line.replace('# ', '') };
      }
      // ... more parsing rules
    });
};
```

### Performance Optimization

```typescript
// Lazy load content
const [content, setContent] = useState<string>('');

useEffect(() => {
  const loadContent = async () => {
    const magazineContent = await loadMagazineContent(magazineId);
    setContent(magazineContent);
  };
  loadContent();
}, [magazineId]);
```

## 🐛 Troubleshooting

### Common Issues

1. **Navigation Error**: Ensure ReadingScreen is properly added to navigation stack
2. **Content Not Loading**: Check content parameter in navigation
3. **Theme Not Applying**: Verify theme state management
4. **Progress Not Saving**: Check AsyncStorage permissions and implementation

### Debug Tips

```typescript
// Debug navigation
console.log('Navigation params:', route.params);

// Debug content
console.log('Content length:', content?.length);

// Debug progress
console.log('Current progress:', readingProgress);
```

## 📈 Future Enhancements

### Planned Features
- **Text-to-Speech**: Audio reading support
- **Highlighting**: Text highlighting and notes
- **Social Features**: Share reading progress
- **Offline Reading**: Download for offline access
- **Reading Lists**: Organize reading materials
- **Advanced Analytics**: Detailed reading insights

### Integration Points
- **Analytics**: Track reading behavior
- **Recommendations**: Suggest related content
- **Social Sharing**: Share reading progress
- **Achievements**: Reading milestones and badges

## 🎉 Conclusion

The reading page provides a comprehensive, modern reading experience with extensive customization options and progress tracking. The modular architecture makes it easy to extend and customize for specific needs.

For questions or support, refer to the main README.md or create an issue in the repository. 