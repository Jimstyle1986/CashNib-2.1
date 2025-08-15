import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { FinancialGoal, CreateGoalRequest, UpdateGoalRequest } from '../types';
import { authService } from './authService';

class GoalService {
  private readonly COLLECTION_NAME = 'goals';

  async getGoals(): Promise<FinancialGoal[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const goals: FinancialGoal[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          progress: data.targetAmount > 0 ? (data.currentAmount / data.targetAmount) * 100 : 0,
        } as FinancialGoal);
      });

      return goals;
    } catch (error: any) {
      console.error('Get goals error:', error);
      throw new Error(error.message || 'Failed to fetch goals');
    }
  }

  async getGoalById(id: string): Promise<FinancialGoal> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Goal not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        progress: data.targetAmount > 0 ? (data.currentAmount / data.targetAmount) * 100 : 0,
      } as FinancialGoal;
    } catch (error: any) {
      console.error('Get goal error:', error);
      throw new Error(error.message || 'Failed to fetch goal');
    }
  }

  async createGoal(goalData: CreateGoalRequest): Promise<FinancialGoal> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newGoal = {
        ...goalData,
        userId: user.id,
        currentAmount: goalData.currentAmount || 0,
        isCompleted: false,
        status: 'active' as const,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Calculate progress
      newGoal.progress = newGoal.targetAmount > 0 ? (newGoal.currentAmount / newGoal.targetAmount) * 100 : 0;

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newGoal);

      return {
        id: docRef.id,
        ...newGoal
      } as FinancialGoal;
    } catch (error: any) {
      console.error('Create goal error:', error);
      throw new Error(error.message || 'Failed to create goal');
    }
  }

  async updateGoal(id: string, updateData: UpdateGoalRequest): Promise<FinancialGoal> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      // Get current goal data to calculate progress
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Goal not found');
      }

      const currentData = currentDoc.data();
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      // Calculate progress if amounts are updated
      const targetAmount = updateData.targetAmount || currentData.targetAmount;
      const currentAmount = updateData.currentAmount !== undefined ? updateData.currentAmount : currentData.currentAmount;
      
      if (targetAmount > 0) {
        updatedData.progress = (currentAmount / targetAmount) * 100;
        updatedData.isCompleted = currentAmount >= targetAmount;
        
        if (updatedData.isCompleted && currentData.status !== 'completed') {
          updatedData.status = 'completed';
        }
      }

      await updateDoc(docRef, updatedData);

      // Get updated goal
      const updatedDoc = await getDoc(docRef);
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as FinancialGoal;
    } catch (error: any) {
      console.error('Update goal error:', error);
      throw new Error(error.message || 'Failed to update goal');
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Delete goal error:', error);
      throw new Error(error.message || 'Failed to delete goal');
    }
  }

  async addContribution(id: string, amount: number): Promise<FinancialGoal> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Goal not found');
      }

      const currentData = docSnap.data();
      const newCurrentAmount = currentData.currentAmount + amount;
      
      return this.updateGoal(id, {
        currentAmount: newCurrentAmount,
      });
    } catch (error: any) {
      console.error('Add contribution error:', error);
      throw new Error(error.message || 'Failed to add contribution');
    }
  }

  async getActiveGoals(): Promise<FinancialGoal[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        where('status', '==', 'active'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const goals: FinancialGoal[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          progress: data.targetAmount > 0 ? (data.currentAmount / data.targetAmount) * 100 : 0,
        } as FinancialGoal);
      });

      return goals;
    } catch (error: any) {
      console.error('Get active goals error:', error);
      throw new Error(error.message || 'Failed to fetch active goals');
    }
  }
}

export const goalService = new GoalService();