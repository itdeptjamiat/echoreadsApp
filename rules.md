# 📏 EchoReads Development Rules (Read by AI Tools like Cursor)

> This file acts as the **source of truth** for AI-assisted development. It defines strict rules for Cursor/Gemini to follow during code generation.

---

## ✅ Required Technologies

> **Note**: The last three technologies (expo-file-system, expo-screen-capture, expo-crypto) are specifically for protected reading functionality and should not be used for general app storage, token management, or other purposes.

- React Native with **Expo**
- **expo-router** for navigation (file-based)
- **Redux Toolkit** for state management
- **Zod + React Hook Form** for forms and validation
- **Axios** configured instance with interceptors and auth handling
- **expo-secure-store** for storing JWTs and user prefs
- **expo-localization** for i18n and language support
- **React Native Reanimated** for animations and transitions
- **expo-linear-gradient** for gradients and modern UI effects
- **react-native-vector-icons** for consistent iconography (Ionicons)
- **react-native-webview** for embedded web content and payment processing
- **react-native-toast-message** for user feedback and alerts
- **expo-file-system** for offline storage of encrypted PDF blobs (protected reading only)
- **expo-screen-capture** for blocking screenshots/screen recording in reader screens (protected reading only)
- **expo-crypto** for basic crypto helpers in managed builds (protected reading only)

---

## 🛠 Enforced Patterns

### 1. 📁 Project Structure Must Follow:

```
Echoreads/
├── app/                    # Expo Router screens ONLY
│   ├── (auth)/            # Authentication screens
│   ├── (app)/             # Main app screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── redux/             # Redux state management
│   │   ├── slices/        # Redux slices
│   │   ├── actions/       # Async thunks
│   │   ├── selectors/     # Memoized selectors
│   │   ├── utils/         # Redux utilities
│   │   └── store.ts       # Store configuration
│   ├── form/              # Form components
│   ├── axios/             # API configuration
│   ├── hooks/             # Custom hooks
│   ├── components/        # UI components
│   ├── typography/        # Typography system
│   └── services/          # External services
```

**CRITICAL**: Do not place logic inside `/app`. Only screens go here.

---

### 2. 🧾 Forms Must Use:

- **React Hook Form + Zod** - ONLY allowed form method
- **FormProvider** wrapper from `/src/form/FormProvider.tsx`
- **TextField** component from `/src/form/TextField.tsx`
- **Zod schema validation** for all form inputs
- **No inline forms** - always use FormProvider and TextField components
- **Theme integration** - all form components use useTheme() colors

---

### 3. 🗃️ Redux State Management Must Use:

- **Redux Toolkit** with `configureStore()`
- **redux-persist** with `AsyncStorage` for persistence
- **PersistGate** in `_layout.tsx` for rehydration
- Slice-based reducers in `/src/redux/slices/`
- Combine reducers: `auth`, `listing`, `bid`, `chat`, `orders`
- Only persist `auth` state (whitelist: ['auth'])
- Use `persistReducer()` wrapper for all root reducers

---

### 4. 📡 API & Network Layer Must Use:

- **EchoInstance** from `/src/axios/EchoInstance.ts` for ALL API calls (ONLY allowed Axios setup)
- **APIIns** configured instance with baseURL and auth headers
- **attachAuthToken()** for setting JWT tokens
- **401 interceptor** with retry protection and automatic token clearance
- **attachAuthTokenToAsyncStorage()** for token persistence
- **All slices/thunks** must import APIIns from EchoInstance.ts
- **Token boot** in `_layout.tsx` using `selectToken` + `attachAuthToken()`

---

### 5. 🔄 Async Actions & User Feedback Must Use:

- **createAsyncThunk** for all API calls (login, signup, data fetching)
- **try/catch blocks** with `rejectWithValue()` in ALL async thunks
- **Toast.show()** for user feedback on success/error (MANDATORY)
- **handleAsyncThunk()** DRY helper pattern in `/src/redux/utils/`
- **extraReducers** with pending/fulfilled/rejected states
- **loading** and **error** states in all slices
- **Toast.show()** for ALL user feedback (success, error, info, warning)
- **NO API calls** directly in slice files (only in actions)
- **Always memoize** expensive selectors with `createSelector()`

---

### 6. 🎯 Redux Selectors Must Use:

- **createSelector()** from Redux Toolkit for memoization
- **Centralized selectors** in `/src/redux/selectors/`
- **Export all selectors** from `/src/redux/selectors/index.ts`
- **Import selectors** in components, never inline state access
- **Naming convention**: `select[StateName][Property]` (e.g., `selectAuthLoading`)
- **Computed selectors** for derived state (e.g., `selectIsAuthReady`)
- **Base selectors** for simple state access (e.g., `selectToken`)

---

### 7. 🎨 Modern UI Components Must Use:

#### Required Component Architecture:
- **ButtonSelectorGroup**: Animated category selectors with gradient variants
- **PostCard**: Content cards with gradient overlays, shadows, and animations
- **SearchBar**: Advanced search with filter integration and focus animations
- **CustomButton**: Enhanced buttons with gradient/primary/ghost variants

#### Component Standards:
- **Reanimated Integration**: All interactive components use spring animations
- **Gradient Support**: LinearGradient for enhanced visual appeal
- **Theme Consistency**: All components use useTheme() for colors
- **Performance**: Memoized styles and optimized animations
- **Accessibility**: Full screen reader support with proper ARIA labels
- **Responsive Design**: Adaptive layouts for different screen sizes

#### Animation Requirements:
- **Spring Animations**: Use `withSpring()` for button presses and interactions
- **Fade Transitions**: Use `FadeInDown`, `FadeInUp` for content loading
- **Layout Animations**: Use `Layout.springify()` for dynamic content
- **Scroll Interactions**: Animated scroll handlers for parallax effects
- **Micro-interactions**: Scale animations on touch with proper feedback

#### Visual Standards:
- **Shadows & Elevation**: Consistent shadow patterns across cards and buttons
- **Border Radius**: 12-20px for modern rounded corners
- **Card Design**: White/dark cards with proper elevation and spacing
- **Typography Scale**: Consistent font sizes and weights across components
- **Color Contrast**: WCAG compliant contrast ratios for accessibility

---

### 8. ❌ Prohibited Patterns:

#### General Patterns:
- ❌ No inline styling - use StyleSheet.create() or useTheme()
- ❌ No `useState` for theme, language, or auth - use Context/Redux
- ❌ No screen logic outside `/app` - business logic in `/src`
- ❌ No unapproved packages unless added to `RULES.md`

#### UI/Theme Patterns:
- ❌ No hardcoded colors - must use theme system
- ❌ No direct style objects - use StyleSheet.create()
- ❌ No custom form components - use FormProvider/TextField
- ❌ No non-Ionicons vector icons - standardize on Ionicons
- ❌ No animations without Reanimated - no Animated API
- ❌ No custom HTTP clients - only EchoInstance.ts allowed

#### Component Patterns:
- ❌ No custom button implementations - use CustomButton variants
- ❌ No custom card components - use PostCard component
- ❌ No custom search inputs - use SearchBar component
- ❌ No custom category selectors - use ButtonSelectorGroup
- ❌ No custom navigation bars - use standard Expo Router layouts
- ❌ No direct WebView usage without proper error handling
- ❌ No payment processing without secure WebView implementation

---

### 9. 🔄 Redux Module Creation Must Follow:

- **Template Pattern**: Use `MODULE_CREATION_TEMPLATE.md` as source of truth
- **File Creation**: `slices/[moduleName]Slice.ts`, `actions/[moduleName]Actions.ts`, `selectors/[moduleName]Selectors.ts`
- **Store Integration**: Update `store.ts` with new reducer in `combineReducers`
- **Selector Export**: Add exports to `/src/redux/selectors/index.ts`
- **Persistence Decision**: Add to whitelist ONLY if explicitly needed
- **Documentation Update**: Always update README.md store shape section
- **Naming Convention**: `select[ModuleName][Property]`, `fetch[ModuleName]Data` patterns

---

### 10. 📜 Documentation Enforcement:

- Every new screen, component, or feature must **update `/README.md`**
- Every new tech/package/method must **update `/RULES.md`**
- **Every Redux module** must update README.md store shape section
- **All Redux changes** must follow MODULE_CREATION_TEMPLATE.md

Cursor must keep this documentation in sync **automatically**.

---

📌 **Cursor Behavior Override:**
> From now on, Cursor must obey this `RULES.md` file. No unapproved tech should be used in suggestions or autogeneration.

---

## ⚠️ Cursor & AI Guidelines

- Always read and respect this file before generating or modifying code.
- Only use libraries explicitly listed in the **Required Technologies** section.
- Do not install or suggest new libraries without user confirmation and `RULES.md` update.
- Any new tool, library, or pattern must be added to this file **before use**.
- Always update `/README.md` and `/RULES.md` after completing any module, screen, or feature.

---

```yaml
ai_enforcement:
  mode: strict
  read_rules: true
  auto_update_docs: true
  disallowed_patterns:
    - inline_styles
    - useState_for_global_state
    - unapproved_libraries
    - business_logic_in_app_folder
    - direct_api_calls_without_async_thunk
    - missing_toast_feedback
    - inline_selectors_in_components
    - direct_state_access_without_selectors
    - direct_axios_usage_without_echo_instance
    - custom_http_clients
    - using_non_echo_instance_axios
    - redux_modules_without_template_pattern
    - skipping_store_integration
    - missing_selector_exports
    - undocumented_store_changes
    - api_calls_in_slice_files
    - async_thunks_without_error_handling
    - unmemoized_expensive_selectors
```

---

## 🔐 Authentication Rules

### Mandatory Authentication Patterns

#### 1. **Form Validation**
- All auth forms **must use Zod + React Hook Form**
- No custom validation or form libraries allowed
- Use `FormProvider` wrapper with Zod schemas
- Use `TextField` component for all inputs

#### 2. **Token Storage**
- Auth tokens must be stored in **Redux Persist (auth only)**
- Never use AsyncStorage directly for tokens
- Never use expo-secure-store for tokens
- Only persist auth slice state via redux-persist whitelist

#### 3. **Token Management**
- Auth headers must be attached using `attachAuthToken(token)`
- Use `selectToken` selector to get token from Redux state
- Call `attachAuthToken()` in `_layout.tsx` on app startup
- Clear tokens using `attachAuthToken(null)` on logout

#### 4. **Error Handling**
- Handle 401 errors globally via Axios interceptor
- 401 errors must dispatch `logout()` action automatically
- Never handle 401 errors in individual components
- Use Redux auth error state for form error display

#### 5. **Authentication Flow**
- Login → Store token in Redux → Attach to Axios → Navigate to app
- Logout → Clear Redux state → Clear Axios headers → Navigate to auth
- 401 Error → Clear token → Clear state → Navigate to auth

#### 6. **Prohibited Patterns**
- ❌ No direct AsyncStorage token storage
- ❌ No expo-secure-store for auth tokens
- ❌ No manual 401 error handling in components
- ❌ No custom form validation libraries
- ❌ No direct axios usage without EchoInstance
- ❌ No token storage outside Redux Persist

#### 7. **Required Components**
- Use `FormProvider` for all auth forms
- Use `TextField` for all form inputs
- Use `CustomButton` for all buttons
- Use `useTheme()` for all styling
- Use `H1` and `Body` from Typo system

#### 8. **State Management**
- All auth state in `authSlice.ts`
- Use `createAsyncThunk` for all auth API calls
- Use `createSelector` for all auth selectors
- Export selectors from `selectState.ts`
- Persist only auth state via redux-persist

### Authentication File Structure
```
src/
├── redux/
│   ├── slices/authSlice.ts          # Auth state + reducers
│   ├── actions/authActions.ts       # Auth async thunks
│   └── slices/selectState.ts        # Auth selectors
├── form/
│   ├── FormProvider.tsx             # Form wrapper
│   ├── TextField.tsx                # Input component
│   └── schemas/authSchema.ts        # Zod validation schemas
├── axios/
│   └── EchoInstance.ts              # Axios with auth interceptors
└── hooks/
    └── useTheme.ts                  # Theme hook

app/(auth)/
├── login.tsx                        # Sign in form
├── signup.tsx                       # Registration form
├── verifyEmail.tsx                  # OTP verification
├── forgotPassword.tsx               # Password reset
└── resetPassword.tsx                # New password form
```
