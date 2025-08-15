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
import { Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../types';
import { authService } from './authService';

class BudgetService {
  private readonly COLLECTION_NAME = 'budgets';

  async getBudgets(): Promise<Budget[]> {
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
      const budgets: Budget[] = [];

      snapshot.forEach((doc) => {
        budgets.push({
          id: doc.id,
          ...doc.data()
        } as Budget);
      });

      return budgets;
    } catch (error: any) {
      console.error('Get budgets error:', error);
      throw new Error(error.message || 'Failed to fetch budgets');
    }
  }

  async getBudgetById(id: string): Promise<Budget> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Budget not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Budget;
    } catch (error: any) {
      console.error('Get budget error:', error);
      throw new Error(error.message || 'Failed to fetch budget');
    }
  }

  async createBudget(budgetData: CreateBudgetRequest): Promise<Budget> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newBudget = {
        ...budgetData,
        userId: user.id,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newBudget);

      return {
        id: docRef.id,
        ...newBudget
      } as Budget;
    } catch (error: any) {
      console.error('Create budget error:', error);
      throw new Error(error.message || 'Failed to create budget');
    }
  }

  async updateBudget(id: string, updateData: UpdateBudgetRequest): Promise<Budget> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updatedData);

      // Get updated budget
      const updatedDoc = await getDoc(docRef);
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Budget;
    } catch (error: any) {
      console.error('Update budget error:', error);
      throw new Error(error.message || 'Failed to update budget');
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Delete budget error:', error);
      throw new Error(error.message || 'Failed to delete budget');
    }
  }

  async getActiveBudget(): Promise<Budget | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Budget;
    } catch (error: any) {
      console.error('Get active budget error:', error);
      throw new Error(error.message || 'Failed to fetch active budget');
    }
  }
}

export const budgetService = new BudgetService();