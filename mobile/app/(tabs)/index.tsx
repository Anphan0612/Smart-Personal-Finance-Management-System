import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useState} from "react";
import {FlatList, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {NaturalLanguageInput, ParsedTransaction} from "../../components/nlp/NaturalLanguageInput";
import {useDashboardSummary} from "../../hooks/useDashboard";
import {transactionService} from "../../services/api/transactionService";
import {ChatBubble} from "../../components/ui/ChatBubble";
import { TimeFilter } from '../../components/dashboard/TimeFilter';
import { SummaryCard } from '../../components/dashboard/SummaryCard';
import { GrowthChart } from '../../components/dashboard/GrowthChart';

const transactions = [
  { id: "1", title: "Dribbble", sub: "Subscription fee", amount: "-$15.00", icon: "laptop-outline" },
  { id: "2", title: "House", sub: "Saving", amount: "-$50.00", icon: "download-outline" },
  { id: "3", title: "Sony Camera", sub: "Shopping fee", amount: "-$200.00", icon: "cart-outline" },
  { id: "4", title: "Paypal", sub: "Salary", amount: "-$32.00", icon: "logo-paypal" },
  { id: "5", title: "Car", sub: "Saving", amount: "-$40.00", icon: "car-outline" },
];

const savings = [
  { id: "1", name: "Iphone 13 Mini", price: "$699.00", progress: "40%" },
  { id: "2", name: "Macbook Pro M1", price: "$1,499.00", progress: "60%" },
  { id: "3", name: "House", price: "$65,000.00", progress: "30%" },
];

function NLPModal({ visible, onClose, onSave }: {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: ParsedTransaction) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <NaturalLanguageInput
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [showNLPModal, setShowNLPModal] = useState(false);
  const { summary, monthlyTrend, transactions, loading, error, refetch, period, setPeriod } = useDashboardSummary();

  const handleSaveTransaction = async (transaction: ParsedTransaction) => {
    try {
      await transactionService.saveTransaction(transaction);
      alert(`Đã lưu giao dịch thành công: ${transaction.description} - ${transaction.amount.toLocaleString('vi-VN')} VND`);
      // Refresh dashboard data
      await refetch();
      setShowNLPModal(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Có lỗi xảy ra khi lưu giao dịch. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Ionicons name="person-circle" size={40} color="#666" />
              </TouchableOpacity>
              <Text style={styles.title}>Wallet</Text>
              <Ionicons name="ellipsis-vertical" size={22} color="#666" />
            </View>

            {/* Card */}
            <View style={{ marginTop: 10 }}>
              <TimeFilter 
                options={['Tháng này', '3 Tháng']} 
                selected={period === 'current_month' ? 'Tháng này' : '3 Tháng'}
                onSelect={(opt) => setPeriod(opt === 'Tháng này' ? 'current_month' : '3_months')}
              />
            </View>

            <SummaryCard summary={summary} isLoading={loading} />

            <GrowthChart data={
              monthlyTrend?.map((t: any) => ({ value: t.income }))
            } />

            {/* Quick Actions */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Chức năng nhanh</Text>
            </View>

            <View style={styles.quickActions}>
              {/* Row 1 */}
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/transfer')}>
                <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                  <Ionicons name="add-circle" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Thu nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/transfer')}>
                <View style={[styles.actionIcon, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="remove-circle" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Chi tiêu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/reports')}>
                <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="bar-chart" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Báo cáo</Text>
              </TouchableOpacity>

              {/* Row 2 */}
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/budget')}>
                <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
                  <Ionicons name="wallet" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Ngân sách</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/goals')}>
                <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                  <Ionicons name="trophy" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Mục tiêu</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings')}>
                <View style={[styles.actionIcon, { backgroundColor: '#6b7280' }]}>
                  <Ionicons name="settings" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Cài đặt</Text>
              </TouchableOpacity>

              {/* Row 4 - New NLP Feature */}
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowNLPModal(true)}>
                <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                  <Ionicons name="chatbubble" size={24} color="#fff" />
                </View>
                <Text style={styles.actionText}>Nhập tự nhiên</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <Ionicons name="person-circle" size={50} color="#3b82f6" />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Tấn Phước siêu nhân</Text>
                  <Text style={styles.profileEmail}>phuoc@example.com</Text>
                  <Text style={styles.profileLevel}>Cấp độ: VIP Gold</Text>
                </View>
              </View>

              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{transactions?.length || 0}</Text>
                  <Text style={styles.statLabel}>Giao dịch</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {summary ? `${summary.savingsRate}%` : '0%'}
                  </Text>
                  <Text style={styles.statLabel}>Tiết kiệm</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.2</Text>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              </View>
            </View>

            {/* Transactions */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              <Ionicons name="options-outline" size={18} color="#777" />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <View style={styles.iconBox}>
              <Ionicons name="cash-outline" size={20} color="#555" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.transTitle}>{item.description}</Text>
              <Text style={styles.transSub}>
                {item.category} • {new Date(item.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <Text style={[styles.amount, item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
              {item.type === 'expense' ? '-' : ''}{Math.abs(item.amount).toLocaleString('vi-VN')} VND
            </Text>
          </View>
        )}
        ListFooterComponent={
          <>
            {/* Savings */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Savings</Text>
              <Text style={styles.seeAll}>See All</Text>
            </View>

            {savings.map((item) => (
              <View key={item.id} style={styles.saving}>
                <View style={styles.savingRow}>
                  <Text style={styles.savingName}>{item.name}</Text>
                  <Text style={styles.savingPrice}>{item.price}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: `${parseInt(item.progress)}%` }]} />
                </View>
              </View>
            ))}
          </>
        }
      />

      <NLPModal
        visible={showNLPModal}
        onClose={() => setShowNLPModal(false)}
        onSave={handleSaveTransaction}
      />
      <ChatBubble />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  content: {
    padding: 20,
    backgroundColor: '#f6fafe', // Đổi nền theo chuẩn Stitch "surface"
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8, // hạ header xuống 8px từ trên cùng
    paddingTop: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

  card: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  balanceLabel: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },

  balance: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  cardNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  cardName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  exp: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  seeAll: {
    color: "#3b82f6",
    fontSize: 14,
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionButton: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  actionText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  profileLevel: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
    marginTop: 2,
  },

  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statItem: {
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  transaction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  transTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  transSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  saving: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  savingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  savingName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  savingPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },

  expenseAmount: {
    color: "#ef4444",
  },

  incomeAmount: {
    color: "#10b981",
  },
});