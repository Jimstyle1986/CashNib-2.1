import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from '../types';
import { authService } from './authService';

class NotificationService {
  private readonly COLLECTION_NAME = 'notifications';

  async getNotifications(limitCount: number = 50): Promise<Notification[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          isRead: doc.data().read || false, // Ensure backward compatibility
        } as Notification);
      });

      return notifications;
    } catch (error: any) {
      console.error('Get notifications error:', error);
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  async createNotification(notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<Notification> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newNotification = {
        ...notificationData,
        userId: user.id,
        read: false,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newNotification);

      return {
        id: docRef.id,
        ...newNotification
      } as Notification;
    } catch (error: any) {
      console.error('Create notification error:', error);
      throw new Error(error.message || 'Failed to create notification');
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        read: true,
        isRead: true,
        readAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          read: true,
          isRead: true,
          readAt: new Date().toISOString(),
        })
      );

      await Promise.all(updatePromises);
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', user.id),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error: any) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Helper methods for creating specific notification types
  async createBudgetAlert(message: string, budgetId?: string): Promise<Notification> {
    return this.createNotification({
      title: 'Budget Alert',
      message,
      type: 'budget_alert',
      priority: 'high',
      actionUrl: budgetId ? `/budget/${budgetId}` : '/budget',
    });
  }

  async createGoalMilestone(message: string, goalId?: string): Promise<Notification> {
    return this.createNotification({
      title: 'Goal Milestone',
      message,
      type: 'goal_milestone',
      priority: 'medium',
      actionUrl: goalId ? `/goals/${goalId}` : '/goals',
    });
  }

  async createTransactionAnomaly(message: string): Promise<Notification> {
    return this.createNotification({
      title: 'Transaction Alert',
      message,
      type: 'transaction_anomaly',
      priority: 'high',
      actionUrl: '/transactions',
    });
  }

  async createInvestmentUpdate(message: string): Promise<Notification> {
    return this.createNotification({
      title: 'Investment Update',
      message,
      type: 'investment_update',
      priority: 'medium',
      actionUrl: '/investments',
    });
  }
}

export const notificationService = new NotificationService();