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
import { Investment, Portfolio } from '../types';
import { authService } from './authService';

class InvestmentService {
  private readonly COLLECTION_NAME = 'investments';

  async getInvestments(): Promise<Investment[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        orderBy('purchaseDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const investments: Investment[] = [];

      snapshot.forEach((doc) => {
        investments.push({
          id: doc.id,
          ...doc.data()
        } as Investment);
      });

      return investments;
    } catch (error: any) {
      console.error('Get investments error:', error);
      throw new Error(error.message || 'Failed to fetch investments');
    }
  }

  async getInvestmentById(id: string): Promise<Investment> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Investment not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Investment;
    } catch (error: any) {
      console.error('Get investment error:', error);
      throw new Error(error.message || 'Failed to fetch investment');
    }
  }

  async createInvestment(investmentData: Omit<Investment, 'id' | 'userId'>): Promise<Investment> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newInvestment = {
        ...investmentData,
        userId: user.id,
        lastUpdated: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newInvestment);

      return {
        id: docRef.id,
        ...newInvestment
      } as Investment;
    } catch (error: any) {
      console.error('Create investment error:', error);
      throw new Error(error.message || 'Failed to create investment');
    }
  }

  async updateInvestment(id: string, updateData: Partial<Investment>): Promise<Investment> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      const updatedData = {
        ...updateData,
        lastUpdated: new Date().toISOString(),
      };

      await updateDoc(docRef, updatedData);

      // Get updated investment
      const updatedDoc = await getDoc(docRef);
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Investment;
    } catch (error: any) {
      console.error('Update investment error:', error);
      throw new Error(error.message || 'Failed to update investment');
    }
  }

  async deleteInvestment(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error('Delete investment error:', error);
      throw new Error(error.message || 'Failed to delete investment');
    }
  }

  async getPortfolio(): Promise<Portfolio> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const investments = await this.getInvestments();
      
      const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
      const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);
      const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

      return {
        id: `portfolio_${user.id}`,
        userId: user.id,
        totalValue,
        totalGainLoss,
        totalGainLossPercentage,
        investments,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Get portfolio error:', error);
      throw new Error(error.message || 'Failed to fetch portfolio');
    }
  }

  // Mock method for demo - in real app, this would fetch from a financial data API
  async updatePrices(): Promise<void> {
    try {
      const investments = await this.getInvestments();
      
      // Mock price updates
      for (const investment of investments) {
        const priceChange = (Math.random() - 0.5) * 0.1; // Random change between -5% and +5%
        const newPrice = investment.currentPrice * (1 + priceChange);
        const newTotalValue = newPrice * investment.quantity;
        const newGainLoss = newTotalValue - (investment.purchasePrice * investment.quantity);
        const newGainLossPercentage = ((newPrice - investment.purchasePrice) / investment.purchasePrice) * 100;

        await this.updateInvestment(investment.id, {
          currentPrice: newPrice,
          totalValue: newTotalValue,
          gainLoss: newGainLoss,
          gainLossPercentage: newGainLossPercentage,
        });
      }
    } catch (error: any) {
      console.error('Update prices error:', error);
      throw new Error(error.message || 'Failed to update prices');
    }
  }
}

export const investmentService = new InvestmentService();