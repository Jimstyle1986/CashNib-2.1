import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchBudgets } from '../../store/slices/budgetSlice';
import { fetchGoals } from '../../store/slices/goalSlice';
import { theme } from '../../theme';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transactions, isLoading: transactionsLoading } = useAppSelector((state) => state.transaction);
  const { budgets, isLoading: budgetsLoading } = useAppSelector((state) => state.budget);
  const { goals, isLoading: goalsLoading } = useAppSelector((state) => state.goal);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchTransactions({ limit: 5 })),
        dispatch(fetchBudgets()),
        dispatch(fetchGoals()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const recentTransactions = transactions.slice(0, 5);
  const activeBudget = budgets.find(b => b.isActive);
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

  // Calculate summary data
  const totalIncome = transactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Net Income</Text>
          <Text style={[
            styles.balanceAmount,
            { color: netIncome >= 0 ? theme.colors.success[500] : theme.colors.error[500] }
          ]}>
            ${netIncome.toFixed(2)}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Income</Text>
              <Text style={[styles.balanceItemValue, { color: theme.colors.success[500] }]}>
                +${totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Expenses</Text>
              <Text style={[styles.balanceItemValue, { color: theme.colors.error[500] }]}>
                -${totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="plus" size={24} color={theme.colors.primary[500]} />
              <Text style={styles.actionButtonText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="camera" size={24} color={theme.colors.primary[500]} />
              <Text style={styles.actionButtonText}>Scan Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="chart-pie" size={24} color={theme.colors.primary[500]} />
              <Text style={styles.actionButtonText}>View Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="target" size={24} color={theme.colors.primary[500]} />
              <Text style={styles.actionButtonText}>Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <Icon 
                      name={transaction.isIncome ? "arrow-down" : "arrow-up"} 
                      size={20} 
                      color={transaction.isIncome ? theme.colors.success[500] : theme.colors.error[500]} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.isIncome ? theme.colors.success[500] : theme.colors.error[500] }
                  ]}>
                    {transaction.isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          )}
        </View>

        {/* Budget Overview */}
        {activeBudget && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <View style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetName}>{activeBudget.name}</Text>
                <Text style={styles.budgetPeriod}>{activeBudget.period}</Text>
              </View>
              <View style={styles.budgetProgress}>
                <View style={styles.budgetProgressBar}>
                  <View 
                    style={[
                      styles.budgetProgressFill,
                      { width: '65%' } // This would be calculated based on actual spending
                    ]} 
                  />
                </View>
                <Text style={styles.budgetProgressText}>
                  ${(activeBudget.totalAmount * 0.65).toFixed(2)} of ${activeBudget.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.goalsList}>
              {activeGoals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalDetails}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalProgress}>
                      ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.goalProgressContainer}>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill,
                          { width: `${Math.min(goal.progress, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.goalPercentage}>{goal.progress.toFixed(0)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  userName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  notificationButton: {
    padding: theme.spacing.sm,
  },
  balanceCard: {
    backgroundColor: theme.colors.primary[500],
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  balanceLabel: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.bold,
    color: 'white',
    marginBottom: theme.spacing.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceItemValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.medium,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  transactionsList: {
    paddingHorizontal: theme.spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  transactionCategory: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  transactionAmount: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  budgetCard: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  budgetName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  budgetPeriod: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  budgetProgress: {
    marginTop: theme.spacing.sm,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: theme.colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
  },
  budgetProgressText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  goalsList: {
    paddingHorizontal: theme.spacing.md,
  },
  goalItem: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  goalDetails: {
    marginBottom: theme.spacing.sm,
  },
  goalName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  goalProgress: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.success[500],
  },
  goalPercentage: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    minWidth: 35,
    textAlign: 'right',
  },
});

export default HomeScreen;