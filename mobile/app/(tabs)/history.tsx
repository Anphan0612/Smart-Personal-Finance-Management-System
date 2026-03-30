import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";

const transactionHistory = [
  { id: "1", title: "Dribbble", sub: "Subscription fee", amount: "-$15.00", date: "2024-03-14", type: "expense", icon: "laptop-outline" },
  { id: "2", title: "House", sub: "Saving", amount: "-$50.00", date: "2024-03-13", type: "saving", icon: "download-outline" },
  { id: "3", title: "Sony Camera", sub: "Shopping fee", amount: "-$200.00", date: "2024-03-12", type: "expense", icon: "cart-outline" },
  { id: "4", title: "Paypal", sub: "Salary", amount: "+$2,500.00", date: "2024-03-11", type: "income", icon: "logo-paypal" },
  { id: "5", title: "Car", sub: "Saving", amount: "-$40.00", date: "2024-03-10", type: "saving", icon: "car-outline" },
  { id: "6", title: "Freelance", sub: "Project payment", amount: "+$800.00", date: "2024-03-09", type: "income", icon: "briefcase-outline" },
  { id: "7", title: "Netflix", sub: "Monthly subscription", amount: "-$12.99", date: "2024-03-08", type: "expense", icon: "film-outline" },
  { id: "8", title: "Investment", sub: "Stock dividend", amount: "+$150.00", date: "2024-03-07", type: "income", icon: "trending-up-outline" },
];

export default function HistoryScreen() {
  const router = useRouter();

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income': return '#10b981';
      case 'expense': return '#ef4444';
      case 'saving': return '#3b82f6';
      default: return '#333';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Thu nhập';
      case 'expense': return 'Chi tiêu';
      case 'saving': return 'Tiết kiệm';
      default: return 'Khác';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng thu nhập</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>+$3,450.00</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng chi tiêu</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>-$317.99</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Cân bằng</Text>
          <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>+$3,132.01</Text>
        </View>
      </View>

      <FlatList
        data={transactionHistory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: getAmountColor(item.type) + '20' }]}>
                <Ionicons name={item.icon as any} size={20} color={getAmountColor(item.type)} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionSub}>{item.sub}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, { color: getAmountColor(item.type) }]}>
                {item.amount}
              </Text>
              <Text style={styles.transactionType}>{getTypeLabel(item.type)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  summary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  transactionSub: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
  },
});