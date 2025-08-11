import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface BidState {
  isLoading: boolean;
  error: string | null;
}

const initialState: BidState = {
  isLoading: false,
  error: null,
};

const bidSlice = createSlice({
  name: 'bid',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = bidSlice.actions;
export const selectBid = (state: RootState) => state.bid;
export default bidSlice.reducer; 