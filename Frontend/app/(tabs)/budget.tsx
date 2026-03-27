import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, ProgressBarAndroid, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BudgetScreen() {
  const router = useRouter();

  const budgets = [
    {
      id: '1',
      category: 'Ăn uống',
      spent: 450000,
      limit: 600000,
      color: '#ef4444',
      icon: 'restaurant'
    },
    {
      id: '2',
      category: 'Di chuyển',
      spent: 280000,
      limit: 400000,
      color: '#3b82f6',
      icon: 'car'
    },
    {
      id: '3',
      category: 'Mua sắm',
      spent: 150000,
      limit: 300000,
      color: '#f59e0b',
      icon: 'bag'
    },
    {
      id: '4',
      category: 'Giải trí',
      spent: 80000,
      limit: 200000,
      color: '#8b5cf6',
      icon: 'game-controller'
    },
    {
      id: '5',
      category: 'Sức khỏe',
      spent: 120000,
      limit: 150000,
      color: '#10b981',
      icon: 'medical'
    },
  ];

  const getProgress = (spent: number, limit: number) => {
    return Math.min(spent / limit, 1);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 0.9) return '#ef4444';
    if (ratio >= 0.7) return '#f59e0b';
    return '#10b981';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ngân sách</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan ngân sách</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã chi</Text>
              <Text style={styles.summaryValue}>1,080,000 VND</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Giới hạn</Text>
              <Text style={styles.summaryValue}>1,650,000 VND</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Còn lại</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>570,000 VND</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ngân sách theo danh mục</Text>

        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={styles.budgetLeft}>
                <View style={[styles.budgetIcon, { backgroundColor: budget.color + '20' }]}>
                  <Ionicons name={budget.icon as any} size={20} color={budget.color} />
                </View>
                <View>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <Text style={styles.budgetProgress}>
                    {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()} VND
                  </Text>
                </View>
              </View>
              <Text style={[styles.budgetPercentage, { color: getProgressColor(budget.spent, budget.limit) }]}>
                {Math.round((budget.spent / budget.limit) * 100)}%
              </Text>
            </View>

            <View style={styles.progressContainer}>
              {Platform.OS === 'android' ? (
                <ProgressBarAndroid
                  styleAttr="Horizontal"
                  indeterminate={false}
                  progress={getProgress(budget.spent, budget.limit)}
                  color={getProgressColor(budget.spent, budget.limit)}
                  style={styles.progressBar}
                />
              ) : (
                <View style={styles.progressBarIOS}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgress(budget.spent, budget.limit) * 100}%`,
                        backgroundColor: getProgressColor(budget.spent, budget.limit)
                      }
                    ]}
                  />
                </View>
              )}
            </View>

            <Text style={styles.budgetRemaining}>
              Còn lại: {(budget.limit - budget.spent).toLocaleString()} VND
            </Text>
          </View>
        ))}

        <TouchableOpacity style={styles.addBudgetButton}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBudgetButtonText}>Thêm ngân sách mới</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  budgetProgress: {
    fontSize: 12,
    color: "#666",
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
  },
  progressBarIOS: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetRemaining: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  addBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    height: 50,
    marginTop: 10,
  },
  addBudgetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});