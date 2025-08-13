// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  accessToken?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  success?: boolean;
  error?: string;
}

export interface BiometricAuthData {
  email: string;
  biometricId: string;
}

export interface SocialAuthData {
  provider: 'google' | 'apple';
  token: string;
  email: string;
  name: string;
  profilePicture?: string;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  period: 'weekly' | 'monthly' | 'yearly';
  totalAmount: number;
  categories: BudgetCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
}

export interface BudgetCategoryData {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface BudgetCategories {
  housing: BudgetCategoryData;
  transportation: BudgetCategoryData;
  food: BudgetCategoryData;
  utilities: BudgetCategoryData;
  healthcare: BudgetCategoryData;
  entertainment: BudgetCategoryData;
  shopping: BudgetCategoryData;
  education: BudgetCategoryData;
  savings: BudgetCategoryData;
  other: BudgetCategoryData;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  description: string;
  isManual: boolean;
  isIncome: boolean;
  accountId?: string;
  tags?: string[];
  location?: string;
  receipt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isIncome: boolean;
  subcategories?: string[];
}

export interface CreateTransactionRequest {
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  description: string;
  isIncome: boolean;
  accountId?: string;
  tags?: string[];
  location?: string;
  receipt?: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  category?: string;
  subcategory?: string;
  date?: string;
  description?: string;
  isIncome?: boolean;
  accountId?: string;
  tags?: string[];
  location?: string;
  receipt?: string;
}

// Goal types
export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  isCompleted: boolean;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  autoContribute?: {
    enabled: boolean;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    sourceAccount?: string;
  };
  milestones?: Array<{
    name: string;
    amount: number;
    reward?: string;
  }>;
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'custom';
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  autoContribute?: {
    enabled: boolean;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    sourceAccount?: string;
  };
  milestones?: Array<{
    name: string;
    amount: number;
    reward?: string;
  }>;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateGoalRequest {
  name?: string;
  description?: string;
  type?: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'custom';
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  status?: 'active' | 'completed' | 'paused';
  autoContribute?: {
    enabled: boolean;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    sourceAccount?: string;
  };
  milestones?: Array<{
    name: string;
    amount: number;
    reward?: string;
  }>;
  tags?: string[];
  isPublic?: boolean;
}

// Investment types
export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'bond' | 'mutual_fund';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate: string;
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  investments: Investment[];
  lastUpdated: string;
}

export interface InvestmentRecommendation {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'bond';
  recommendedAllocation: number;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  reason: string;
}

// Account types
export interface BankAccount {
  id: string;
  userId: string;
  accountId: string;
  institutionName: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  isActive: boolean;
  lastSynced: string;
  plaidAccessToken?: string;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'goal_milestone' | 'transaction_anomaly' | 'investment_update' | 'general';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// AI Insights types
export interface AIInsight {
  id: string;
  userId: string;
  type: 'budget_suggestion' | 'spending_pattern' | 'investment_advice' | 'goal_recommendation';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  isActionable: boolean;
  actionTaken: boolean;
  createdAt: string;
  expiresAt?: string;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  timestamp?: number;
}

export interface BudgetChartData {
  categories: ChartDataPoint[];
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
}

export interface SpendingTrendData {
  period: string;
  data: TimeSeriesDataPoint[];
  comparison?: {
    previousPeriod: TimeSeriesDataPoint[];
    percentageChange: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface OnboardingData {
  monthlyIncome: number;
  monthlyExpenses: number;
  financialGoals: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  primaryFinancialConcern: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  TransactionDetail: { transactionId: string };
  AddTransaction: undefined;
  BudgetDetail: { budgetId: string };
  CreateBudget: undefined;
  GoalDetail: { goalId: string };
  CreateGoal: undefined;
  InvestmentDetail: { investmentId: string };
  AddInvestment: undefined;
  PortfolioAnalysis: undefined;
  ReportDetail: { reportId: string };
  Camera: {
    mode?: 'photo' | 'receipt' | 'document';
    onCapture?: (imageUri: string) => void;
  };
  ReceiptScanner: {
    imageUri: string;
    onScanComplete?: (data: any) => void;
  };
  QRCodeScanner: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Budget: undefined;
  Goals: undefined;
  Investments: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  Reports: undefined;
  AIAssistant: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type TransactionStackParamList = {
  TransactionList: undefined;
  TransactionDetails: { transactionId: string };
  AddTransaction: undefined;
  TransactionCategories: undefined;
};

export type BudgetStackParamList = {
  BudgetOverview: undefined;
  CreateBudget: undefined;
  BudgetDetails: { budgetId: string };
  BudgetCategories: undefined;
};

// Budget request types
export interface CreateBudgetRequest {
  name: string;
  totalAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  description?: string;
  currency?: string;
}

export interface UpdateBudgetRequest {
  name?: string;
  totalAmount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  categories?: BudgetCategory[];
  description?: string;
  currency?: string;
  status?: 'active' | 'paused' | 'completed';
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Settings types
export interface AppSettings {
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    budgetAlerts: boolean;
    goalMilestones: boolean;
    transactionAnomalies: boolean;
    investmentUpdates: boolean;
    marketNews: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
  security: {
    biometricAuth: boolean;
    autoLock: boolean;
    autoLockTimeout: number; // in minutes
  };
}

// Report types
export interface Report {
  id: string;
  userId: string;
  name: string;
  type: 'spending' | 'income' | 'budget' | 'investment' | 'net_worth' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    categories?: string[];
    accounts?: string[];
    tags?: string[];
  };
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  period: {
    start: string;
    end: string;
  };
}

export interface SpendingAnalysis {
  categoryBreakdown: ChartDataPoint[];
  monthlyTrends: TimeSeriesDataPoint[];
  averageDaily: number;
  averageMonthly: number;
  topMerchants: {
    name: string;
    amount: number;
    transactions: number;
  }[];
}

export interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  categoryPerformance: {
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    status: 'under' | 'on_track' | 'over';
  }[];
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  parameters?: Record<string, any>;
  value?: number;
  timestamp?: number;
}

export interface ScreenView {
  screen_name: string;
  screen_class?: string;
  parameters?: Record<string, any>;
  timestamp?: number;
}

export interface CustomEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp?: number;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  context?: string;
  additional_data?: Record<string, any>;
  timestamp?: number;
  session_id?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  attributes?: Record<string, any>;
  timestamp?: number;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  subscriptionType?: string;
  accountCreatedAt?: string;
  lastActiveAt?: string;
  [key: string]: any;
}

export interface PerformanceMetrics {
  screenLoadTime: number;
  apiResponseTime: number;
  crashCount: number;
  errorCount: number;
  memoryUsage: number;
}

export interface AnalyticsSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  screenViews: string[];
  events: AnalyticsEvent[];
  userId?: string;
}

// Backup types
export interface BackupData {
  version: string;
  timestamp?: string;
  createdAt?: string;
  userId?: string;
  settings?: any;
  transactions?: any;
  budgets?: any;
  goals?: any;
  investments?: any;
  data?: {
    user: User;
    transactions: Transaction[];
    budgets: Budget[];
    goals: FinancialGoal[];
    investments: Investment[];
    settings: AppSettings;
    accounts: BankAccount[];
  };
  metadata?: {
    deviceId: string;
    appVersion: string;
    platform: string;
  };
}

export interface BackupInfo {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  provider: 'local' | 'icloud' | 'google_drive' | 'dropbox';
  isEncrypted: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  provider: 'local' | 'icloud' | 'google_drive' | 'dropbox';
  encryption: boolean;
  maxBackups: number;
  includeImages: boolean;
}

export interface BackupMetadata {
  id: string;
  name?: string;
  size: number;
  createdAt: string;
  type?: 'manual' | 'automatic';
  provider: 'local' | 'icloud' | 'google_drive' | 'dropbox' | 'cloud';
  isEncrypted?: boolean;
  checksum?: string;
  version?: string;
  description?: string;
  dataTypes?: {
    settings: boolean;
    transactions: boolean;
    budgets: boolean;
    goals: boolean;
    investments: boolean;
  };
}

export interface RestoreOptions {
  backupId?: string;
  overwriteExisting?: boolean;
  restoreSettings?: boolean;
  restoreTransactions?: boolean;
  restoreBudgets?: boolean;
  restoreGoals?: boolean;
  restoreInvestments?: boolean;
  selectiveRestore?: {
    transactions: boolean;
    budgets: boolean;
    goals: boolean;
    investments: boolean;
    settings: boolean;
  };
}

export enum BackupStatus {
  IDLE = 'idle',
  BACKING_UP = 'backing_up',
  RESTORING = 'restoring',
  ERROR = 'error',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum BackupProvider {
  LOCAL = 'local',
  ICLOUD = 'icloud',
  GOOGLE_DRIVE = 'google_drive',
  DROPBOX = 'dropbox',
  CLOUD = 'cloud'
}

// Sync types
export interface SyncItem {
  id: string;
  type: 'transaction' | 'budget' | 'goal' | 'investment' | 'setting';
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;
  deviceId: string;
  synced: boolean;
  retryCount: number;
}

export interface SyncStatus {
  lastSyncAt?: number;
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  failedItems: number;
  conflictItems: number;
}

export interface SyncConflict {
  id: string;
  type: string;
  localData: Record<string, any>;
  remoteData: Record<string, any>;
  timestamp: number;
  resolved: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  syncOnWifiOnly: boolean;
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual';
  syncFrequency: number; // in minutes
  enabledDataTypes: {
    transactions: boolean;
    budgets: boolean;
    goals: boolean;
    investments: boolean;
    settings: boolean;
  };
}

// Device and platform types
export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  lastActiveAt: string;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};