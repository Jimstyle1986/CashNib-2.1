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
  orderBy, 
  limit, 
  startAfter 
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest, PaginatedResponse } from '../types';
import { authService } from './authService';

class TransactionService {
  private readonly COLLECTION_NAME = 'transactions';

  async getTransactions(params: any = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const {
        page = 1,
        limit: pageLimit = 20,
        category,
        type,
        startDate,
        endDate,
        sortBy = 'date',
        sortOrder = 'desc'
      } = params;

      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        orderBy(sortBy, sortOrder),
        limit(pageLimit)
      );

      // Add filters
      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (type) {
        q = query(q, where('isIncome', '==', type === 'income'));
      }

      const snapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });

      return {
        data: transactions,
        pagination: {
          page,
          limit: pageLimit,
          total: transactions.length,
          totalPages: Math.ceil(transactions.length / pageLimit),
          hasNext: transactions.length === pageLimit,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      console.error('Get transactions error:', error);
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  }

  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Transaction not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Transaction;
    } catch (error: any) {
      console.error('Get transaction error:', error);
      throw new Error(error.message || 'Failed to fetch transaction');
    }
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newTransaction = {
        ...transactionData,
        userId: user.id,
        isManual: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newTransaction);

      return {
        id: docRef.id,
        ...newTransaction
      } as Transaction;
    } catch (error: any) {
      console.error('Create transaction error:', error);
      throw new Error(error.message || 'Failed to create transaction');
    }
  }

  async updateTransaction(id: string, updateData: UpdateTransactionRequest): Promise<Transaction> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updatedData);

      // Get updated transaction
      const updatedDoc = await getDoc(docRef);
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Transaction;
    } catch (error: any) {
      console.error('Update transaction error:', error);
      throw new Error(error.message || 'Failed to update transaction');
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      throw new Error(error.message || 'Failed to delete transaction');
    }
  }

  async getRecentTransactions(limitCount: number = 10): Promise<Transaction[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });

      return transactions;
    } catch (error: any) {
      console.error('Get recent transactions error:', error);
      throw new Error(error.message || 'Failed to fetch recent transactions');
    }
  }

  // Mock methods for demo purposes
  async getCategories(): Promise<string[]> {
    return [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Income',
      'Other'
    ];
  }

  async categorizeTransaction(description: string, amount: number): Promise<string> {
    // Simple categorization logic for demo
    const desc = description.toLowerCase();
    
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('grocery')) {
      return 'Food & Dining';
    }
    if (desc.includes('gas') || desc.includes('uber') || desc.includes('taxi')) {
      return 'Transportation';
    }
    if (desc.includes('amazon') || desc.includes('store') || desc.includes('shop')) {
      return 'Shopping';
    }
    if (desc.includes('movie') || desc.includes('netflix') || desc.includes('spotify')) {
      return 'Entertainment';
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('internet')) {
      return 'Bills & Utilities';
    }
    
    return 'Other';
  }

  async getTransactionStats(userId: string, period: string): Promise<any> {
    // Mock implementation for demo
    return {
      totalIncome: 5000,
      totalExpenses: 3500,
      netIncome: 1500,
      transactionCount: 45,
      averageTransaction: 77.78,
    };
  }

  async exportTransactions(userId: string, options: any): Promise<any> {
    // Mock implementation for demo
    return {
      url: 'https://example.com/export.csv',
      filename: 'transactions_export.csv',
    };
  }

  async importTransactions(userId: string, transactions: any[]): Promise<any> {
    // Mock implementation for demo
    return {
      imported: transactions.length,
      failed: 0,
      duplicates: 0,
    };
  }
}

export const transactionService = new TransactionService();