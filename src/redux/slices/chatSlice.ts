import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface ChatState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = chatSlice.actions;
export const selectChat = (state: RootState) => state.chat;
export default chatSlice.reducer; 