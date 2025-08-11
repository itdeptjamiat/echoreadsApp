import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface OrdersState {
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = ordersSlice.actions;
export const selectOrders = (state: RootState) => state.orders;
export default ordersSlice.reducer; 