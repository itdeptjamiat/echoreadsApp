import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Types
export interface Magazine {
  _id: string;
  name: string;
  category: string;
  type: string;
  image: string;
  downloads: number;
  rating: number;
  description: string;
  magzineType: string;
  createdAt?: string;
  fileType?: string;
  isActive?: boolean;
  mid?: number;
  file?: string;
  reviews?: any[];
  __v?: number;
}

export interface ListingState {
  magazines: Magazine[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
}

// Initial state
const initialState: ListingState = {
  magazines: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
};

// Async thunks
export const fetchMagazines = createAsyncThunk(
  'listing/fetchMagazines',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call using EchoInstance
      const response = await fetch('https://api.echoreads.online/api/v1/user/magzines');
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch magazines');
      }

      return data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Slice
const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMagazines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMagazines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.magazines = action.payload;
        state.error = null;
      })
      .addCase(fetchMagazines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setSelectedCategory, setSearchQuery, clearError } = listingSlice.actions;

// Selectors
export const selectListing = (state: RootState) => state.listing;
export const selectMagazines = (state: RootState) => state.listing.magazines;
export const selectListingLoading = (state: RootState) => state.listing.isLoading;
export const selectListingError = (state: RootState) => state.listing.error;
export const selectSelectedCategory = (state: RootState) => state.listing.selectedCategory;
export const selectSearchQuery = (state: RootState) => state.listing.searchQuery;

export default listingSlice.reducer; 