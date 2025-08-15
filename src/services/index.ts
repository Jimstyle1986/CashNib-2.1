import { authService } from './authService';
import { transactionService } from './transactionService';
import { budgetService } from './budgetService';
import { goalService } from './goalService';
import { investmentService } from './investmentService';
import { notificationService } from './notificationService';

export const initializeServices = async () => {
  try {
    console.log('Initializing services...');
    
    // Initialize any service-specific configurations
    await authService.initialize();
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Service initialization failed:', error);
    throw error;
  }
};

export {
  authService,
  transactionService,
  budgetService,
  goalService,
  investmentService,
  notificationService,
};