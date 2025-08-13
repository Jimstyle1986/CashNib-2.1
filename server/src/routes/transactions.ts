import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { transactionService } from '../services/transactionService';
import { commonSchemas } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createTransactionSchema = Joi.object({
  amount: commonSchemas.amount,
  category: commonSchemas.category,
  description: commonSchemas.description,
  date: commonSchemas.date,
  type: Joi.string().valid('income', 'expense', 'transfer').required(),
  account: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  location: Joi.object({
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    address: Joi.string().optional()
  }).optional(),
  receipt: Joi.object({
    url: Joi.string().uri().optional(),
    filename: Joi.string().optional()
  }).optional()
});

const updateTransactionSchema = Joi.object({
  amount: commonSchemas.amount.optional(),
  category: commonSchemas.category.optional(),
  description: commonSchemas.description,
  date: commonSchemas.optionalDate,
  type: Joi.string().valid('income', 'expense', 'transfer').optional(),
  account: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  location: Joi.object({
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    address: Joi.string().optional()
  }).optional(),
  receipt: Joi.object({
    url: Joi.string().uri().optional(),
    filename: Joi.string().optional()
  }).optional()
});

const getTransactionsQuerySchema = Joi.object({
  page: commonSchemas.pagination.page,
  limit: commonSchemas.pagination.limit,
  category: Joi.string().optional(),
  type: Joi.string().valid('income', 'expense', 'transfer').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  minAmount: Joi.number().optional(),
  maxAmount: Joi.number().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('date', 'amount', 'category').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const categorizeTransactionSchema = Joi.object({
  description: Joi.string().required(),
  amount: Joi.number().required()
});

const exportTransactionsSchema = Joi.object({
  format: Joi.string().valid('csv', 'pdf', 'excel').default('csv'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  categories: Joi.array().items(Joi.string()).optional()
});

const idParamSchema = Joi.object({
  id: commonSchemas.id
});

// Get all transactions
router.get('/', validateQuery(getTransactionsQuerySchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const filters = req.query;
  
  const result = await transactionService.getTransactions(userId, filters);
  
  res.json({
    success: true,
    ...result
  });
}));

// Get transaction by ID
router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;
  
  const transaction = await transactionService.getTransactionById(userId, id);
  
  res.json({
    success: true,
    data: transaction
  });
}));

// Create new transaction
router.post('/', validateRequest(createTransactionSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const transactionData = req.body;
  
  const transaction = await transactionService.createTransaction(userId, transactionData);
  
  res.status(201).json({
    success: true,
    data: transaction,
    message: 'Transaction created successfully'
  });
}));

// Update transaction
router.put('/:id', validateParams(idParamSchema), validateRequest(updateTransactionSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;
  const updateData = req.body;
  
  const transaction = await transactionService.updateTransaction(userId, id, updateData);
  
  res.json({
    success: true,
    data: transaction,
    message: 'Transaction updated successfully'
  });
}));

// Delete transaction
router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;
  
  await transactionService.deleteTransaction(userId, id);
  
  res.json({
    success: true,
    message: 'Transaction deleted successfully'
  });
}));

// Get transaction categories
router.get('/categories/list', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  
  const categories = await transactionService.getCategories(userId);
  
  res.json({
    success: true,
    data: categories
  });
}));

// Auto-categorize transaction
router.post('/categorize', validateRequest(categorizeTransactionSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { description, amount } = req.body;
  
  const category = await transactionService.categorizeTransaction(description, amount);
  
  res.json({
    success: true,
    category
  });
}));

// Get transaction statistics
router.get('/stats/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const { period = 'month' } = req.query;
  
  const stats = await transactionService.getTransactionStats(userId, period as string);
  
  res.json({
    success: true,
    data: stats
  });
}));

// Export transactions
router.post('/export', validateRequest(exportTransactionsSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const exportOptions = req.body;
  
  const exportData = await transactionService.exportTransactions(userId, exportOptions);
  
  res.json({
    success: true,
    data: exportData
  });
}));

// Bulk import transactions
router.post('/import', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const { transactions } = req.body;
  
  const result = await transactionService.importTransactions(userId, transactions);
  
  res.json({
    success: true,
    data: result
  });
}));

// Get recent transactions
router.get('/recent/list', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const transactions = await transactionService.getRecentTransactions(userId, limit);
  
  res.json({
    success: true,
    data: transactions
  });
}));

export default router;