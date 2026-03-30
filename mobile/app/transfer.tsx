import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";

export default function TransferScreen() {
  const router = useRouter();

  const handleTransfer = () => {
    Alert.alert("Chuyển tiền thành công!", "Giao dịch của bạn đã được xử lý.");
    router.back();
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuyển tiền</Text>
        <TouchableOpacity>
          <Ionicons name="scan" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceAmount}>1.000.000.000 VND</Text>
        </View>

        <View style={styles.transferForm}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên người nhận"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số tài khoản / Số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="business" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên ngân hàng (không bắt buộc)"
            />
          </View>

          <Text style={styles.sectionTitle}>Số tiền chuyển</Text>

          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>VND</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          <Text style={styles.sectionTitle}>Số tiền gợi ý</Text>
          <View style={styles.quickAmountContainer}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity key={amount} style={styles.quickAmountButton}>
                <Text style={styles.quickAmountText}>
                  {amount.toLocaleString()} VND
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="chatbox" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Lời nhắn (không bắt buộc)"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.feeInfo}>
            <Text style={styles.feeLabel}>Phí chuyển tiền:</Text>
            <Text style={styles.feeAmount}>Miễn phí</Text>
          </View>

          <TouchableOpacity style={styles.transferButton} onPress={handleTransfer}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.transferButtonText}>Chuyển tiền</Text>
          </TouchableOpacity>
        </View>
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
  balanceCard: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    alignItems: "center",
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  transferForm: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  currencySymbol: {
    fontSize: 16,
    color: "#666",
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  quickAmountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  quickAmountButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  feeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  feeLabel: {
    fontSize: 14,
    color: "#374151",
  },
  feeAmount: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
  },
  transferButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    borderRadius: 12,
    height: 50,
    marginTop: 10,
  },
  transferButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});