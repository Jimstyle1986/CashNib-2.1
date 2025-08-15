import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Investment, Portfolio } from '../../types';
import { investmentService } from '../../services/investmentService';

interface InvestmentState {
  investments: Investment[];
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvestmentState = {
  investments: [],
  portfolio: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchInvestments = createAsyncThunk(
  'investment/fetchInvestments',
  async (_, { rejectWithValue }) => {
    try {
      const investments = await investmentService.getInvestments();
      return investments;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPortfolio = createAsyncThunk(
  'investment/fetchPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const portfolio = await investmentService.getPortfolio();
      return portfolio;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const investmentSlice = createSlice({
  name: 'investment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch investments
      .addCase(fetchInvestments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch portfolio
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.portfolio = action.payload;
      });
  },
});

export const { clearError } = investmentSlice.actions;
export default investmentSlice.reducer;