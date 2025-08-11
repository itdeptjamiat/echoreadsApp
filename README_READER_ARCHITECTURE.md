# 📚 EchoReads Reader Architecture

## Overview

The EchoReads PDF reader provides a Readly-style reading experience with horizontal paging, zoom controls, and optional offline capabilities. The system is built with security in mind, preventing external navigation and ensuring PDFs are only rendered within the app.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Reader Screen                            │
│                (app/reader/[issueId].tsx)                  │
├─────────────────────────────────────────────────────────────┤
│  Reader Chrome  │  Reader Pager  │  Download Status       │
│  • Header       │  • PagerView   │  • Offline Status      │
│  • Controls     │  • Page Nav    │  • Download Progress   │
│  • Navigation   │  • Zoom        │  • Remove Offline      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Redux Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Reader Slice   │  Reader Actions│  Reader Selectors      │
│  • State        │  • Async       │  • Memoized            │
│  • UI State     │  • Thunks      │  • Computed            │
│  • Non-persist  │  • API Calls   │  • Performance         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Bridge Layer                             │
├─────────────────────────────────────────────────────────────┤
│  PDF Bridge     │  WebView      │  PDF.js Viewer          │
│  • Type Safety  │  • Secure     │  • Local HTML           │
│  • Messages     │  • Locked     │  • CSP Headers          │
│  • Validation   │  • No External│  • Selection Disabled   │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Bridge Contract

### React Native → WebView Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `LOAD_PDF` | `{ dataUrl, issueId, watermarkData? }` | Send PDF data to viewer |
| `RENDER_PAGE` | `{ page, zoom?, theme? }` | Request specific page rendering |
| `SET_ZOOM` | `{ zoom, page }` | Set zoom level for current page |
| `SET_THEME` | `{ mode: 'pageLight' \| 'pageDark' }` | Set viewer theme |
| `QUERY_META` | `{ issueId }` | Request document metadata |

### WebView → React Native Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `READY` | `{ viewerVersion, capabilities }` | Viewer is ready to receive commands |
| `DOC_META` | `{ numPages, title?, author?, issueId, fileSize }` | Document metadata |
| `PAGE_CHANGE` | `{ page, totalPages, timestamp }` | Page change event |
| `RENDER_DONE` | `{ page, renderTime, zoom }` | Page rendering completed |
| `ERROR` | `{ message, code?, page?, timestamp }` | Error occurred in viewer |

## 📊 Store Shape

### Reader State (Non-Persisted)

```typescript
interface ReaderState {
  // Current reading session
  currentIssue: ReaderIssue | null;
  currentPage: number;
  totalPages: number;
  readTime: number;
  
  // PDF data and viewer state
  pdfDataUrl: string | null;
  isPdfLoaded: boolean;
  isViewerReady: boolean;
  
  // Reading progress and sync
  readingProgress: Record<string, ReadingProgress>;
  
  // Offline capabilities
  offlineIssues: Record<string, OfflineIssue>;
  
  // Viewer controls and preferences
  zoomLevel: number;
  theme: 'pageLight' | 'pageDark';
  showControls: boolean;
  
  // Watermark data
  watermarkData: WatermarkData | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Device information
  deviceId: string | null;
}
```

### Reader Issue Interface

```typescript
interface ReaderIssue {
  issueId: string;
  magazineId: string;
  magazineName: string;
  title: string;
  author?: string;
  numPages: number;
  fileSize: number;
  publishedAt: string;
  thumbnail?: string;
}
```

### Reading Progress Interface

```typescript
interface ReadingProgress {
  lastPage: number;
  totalPages: number;
  readTime: number;
  lastReadAt: string;
}
```

### Offline Issue Interface

```typescript
interface OfflineIssue {
  hasOffline: boolean;
  encUri: string | null;
  downloadProgress: number;
  isDownloading: boolean;
}
```

## 🚀 Reader Flow

### 1. Issue Opening
```
User opens issue → dispatch openIssue() → fetch signed URL → fetch PDF bytes → 
convert to data URL → mount PagedPdfWebView → WebView posts READY → 
send LOAD_PDF → WebView loads PDF → posts DOC_META → set page count
```

### 2. Page Navigation
```
User swipes page → PagerView detects change → update Redux state → 
send RENDER_PAGE to WebView → WebView renders page → posts RENDER_DONE → 
update UI state → debounced syncReadingProgress() → API call via EchoInstance
```

### 3. Offline Download (Optional)
```
User taps download → dispatch downloadIssueForOffline() → fetch signed URL → 
stream bytes → encrypt and store → update offline state → show success toast
```

### 4. Offline Reading
```
User opens offline issue → check offline status → decrypt PDF → 
convert to data URL → mount viewer → render pages → track progress locally
```

## 🔒 Security Features

### WebView Hardening
- **Content Security Policy**: Blocks external resources and scripts
- **Navigation Locking**: `onShouldStartLoadWithRequest` only allows local content
- **Touch Blocking**: Prevents selection and copy operations
- **Context Menu Disabled**: Right-click context menu blocked

### Screen Protection
- **Screenshot Blocking**: Uses `expo-screen-capture` to prevent screenshots
- **Screen Recording Block**: Blocks screen recording in reader mode
- **Root Detection**: Best-effort detection of rooted/jailbroken devices

### Content Protection
- **Watermarking**: Visible and invisible watermarks on every page
- **Device Binding**: PDFs bound to specific device
- **Encrypted Storage**: Offline PDFs stored as encrypted blobs
- **No Plaintext**: PDFs never stored as plaintext files

## 📱 User Experience

### Reading Interface
- **Horizontal Paging**: Smooth left/right page navigation
- **Snap Navigation**: Pages snap into place for precise navigation
- **Pinch-to-Zoom**: Zoom in/out on current page
- **Double-tap Zoom**: Quick zoom to fit or 100%
- **Theme Toggle**: Light/dark page themes

### Controls
- **Auto-hide**: Controls automatically hide after 5 seconds
- **Tap to Show**: Tap anywhere to show controls temporarily
- **Page Counter**: Current page / total pages display
- **Progress Bar**: Visual reading progress indicator

### Offline Features
- **Download Status**: Real-time download progress
- **Offline Badge**: Visual indicator for offline availability
- **Storage Management**: Remove offline content option
- **Sync Progress**: Reading progress synced to backend

## 🧪 Testing Plan

### Performance Testing
- [ ] **Large PDF (50-100MB)**: Test with large files for memory usage
- [ ] **Quick Navigation**: Rapid page swiping for render throttling
- [ ] **Memory Leaks**: Check for memory leaks during extended reading
- [ ] **Crash Prevention**: Ensure no crashes with corrupted PDFs

### Security Testing
- [ ] **OS Download Trap**: Verify no external PDF downloads
- [ ] **WebView Lockdown**: Test external navigation blocking
- [ ] **Screenshot Blocking**: Verify screenshots are prevented
- [ ] **Content Protection**: Check watermark visibility and placement

### Functionality Testing
- [ ] **Progress Sync**: Move to page N, reload, resume from server
- [ ] **Offline Reading**: Airplane mode after download, open and read
- [ ] **Download Management**: Download, remove, verify disk cleared
- [ ] **Error Handling**: Network errors, corrupted PDFs, invalid URLs

### UI/UX Testing
- [ ] **Theme Switching**: Light/dark mode toggle
- [ ] **Zoom Controls**: Pinch, double-tap, button zoom
- [ ] **Navigation**: Swipe gestures, page counter accuracy
- [ ] **Responsiveness**: Controls show/hide, loading states

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_URL=https://api.echoreads.online/api/v1

# Security Settings
ENABLE_SCREEN_CAPTURE_BLOCK=true
ENABLE_DEVICE_BINDING=true
ENABLE_WATERMARKING=true

# Offline Settings
OFFLINE_STORAGE_ENABLED=true
MAX_OFFLINE_ISSUES=50
OFFLINE_EXPIRY_DAYS=7
```

### Feature Flags
```typescript
// Enable/disable features
const FEATURES = {
  OFFLINE_READING: true,
  SCREENSHOT_BLOCKING: true,
  WATERMARKING: true,
  DEVICE_BINDING: true,
  PROGRESS_SYNC: true,
};
```

## 📈 Performance Considerations

### Memory Management
- **Page Prefetching**: Only render current page ±1 for memory efficiency
- **Data URL Cleanup**: Clean up PDF data URLs when not needed
- **Render Throttling**: Limit concurrent page renders to prevent memory spikes
- **Garbage Collection**: Force cleanup of large objects when possible

### Rendering Optimization
- **Canvas Rendering**: Use canvas for PDF rendering when possible
- **Lazy Loading**: Load page content only when needed
- **Caching Strategy**: Cache rendered pages in memory temporarily
- **Render Pooling**: Reuse render contexts to reduce allocation overhead

### Network Optimization
- **Signed URL Refresh**: Automatic refresh before expiry
- **Progress Debouncing**: Debounce progress sync calls to reduce API load
- **Batch Operations**: Batch multiple operations when possible
- **Retry Logic**: Exponential backoff for failed operations

## 🚨 Error Handling

### Network Errors
- **Retry Logic**: Automatic retry with exponential backoff
- **Fallback Modes**: Graceful degradation when features unavailable
- **User Feedback**: Clear error messages with actionable steps
- **Recovery Options**: Retry, go back, or continue with limited functionality

### PDF Errors
- **Corrupted Files**: Detect and handle corrupted PDFs gracefully
- **Render Failures**: Fallback rendering or error display
- **Memory Issues**: Handle out-of-memory situations
- **Format Issues**: Support multiple PDF versions and formats

### Security Errors
- **Device Binding**: Handle device mismatch gracefully
- **License Expiry**: Clear messaging about offline expiry
- **Watermark Failures**: Fallback watermarking if primary fails
- **Encryption Errors**: Handle encryption/decryption failures

## 🔄 Future Enhancements

### Planned Features
- **Multi-page View**: Show multiple pages side by side
- **Search Functionality**: Full-text search within PDFs
- **Annotations**: Highlighting, notes, and bookmarks
- **Reading Analytics**: Detailed reading behavior tracking
- **Social Features**: Share highlights and notes

### Performance Improvements
- **WebAssembly**: Use WASM for PDF parsing when available
- **GPU Acceleration**: Hardware-accelerated rendering
- **Streaming**: Progressive PDF loading for large files
- **Compression**: Intelligent compression for offline storage

### Security Enhancements
- **Biometric Lock**: Fingerprint/face ID for sensitive content
- **Time-based Access**: Limit reading to specific time windows
- **Network Validation**: Verify network security before loading
- **Audit Logging**: Comprehensive security event logging

---

This architecture provides a robust, secure, and performant PDF reading experience that meets enterprise-grade requirements while maintaining excellent user experience. 