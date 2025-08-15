import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../../types';
import { budgetService } from '../../services/budgetService';

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  currentBudget: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const budgets = await budgetService.getBudgets();
      return budgets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budgetData: CreateBudgetRequest, { rejectWithValue }) => {
    try {
      const budget = await budgetService.createBudget(budgetData);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ id, data }: { id: string; data: UpdateBudgetRequest }, { rejectWithValue }) => {
    try {
      const budget = await budgetService.updateBudget(id, data);
      return budget;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBudget: (state, action: PayloadAction<Budget | null>) => {
      state.currentBudget = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload);
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        if (state.currentBudget?.id === action.payload.id) {
          state.currentBudget = action.payload;
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter(b => b.id !== action.payload);
        if (state.currentBudget?.id === action.payload) {
          state.currentBudget = null;
        }
      });
  },
});

export const { clearError, setCurrentBudget } = budgetSlice.actions;
export default budgetSlice.reducer;