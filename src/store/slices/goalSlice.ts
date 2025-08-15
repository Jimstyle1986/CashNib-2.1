import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FinancialGoal, CreateGoalRequest, UpdateGoalRequest } from '../../types';
import { goalService } from '../../services/goalService';

interface GoalState {
  goals: FinancialGoal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goal/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const goals = await goalService.getGoals();
      return goals;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGoal = createAsyncThunk(
  'goal/createGoal',
  async (goalData: CreateGoalRequest, { rejectWithValue }) => {
    try {
      const goal = await goalService.createGoal(goalData);
      return goal;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goal/updateGoal',
  async ({ id, data }: { id: string; data: UpdateGoalRequest }, { rejectWithValue }) => {
    try {
      const goal = await goalService.updateGoal(id, data);
      return goal;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goal/deleteGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      await goalService.deleteGoal(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create goal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      // Delete goal
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(g => g.id !== action.payload);
      });
  },
});

export const { clearError } = goalSlice.actions;
export default goalSlice.reducer;