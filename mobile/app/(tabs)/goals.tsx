import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, ProgressBarAndroid, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GoalsScreen() {
  const router = useRouter();

  const goals = [
    {
      id: '1',
      title: 'iPhone 15 Pro',
      target: 1500000,
      current: 750000,
      deadline: '2024-12-31',
      color: '#3b82f6',
      icon: 'phone-portrait'
    },
    {
      id: '2',
      title: 'Du lịch Nhật Bản',
      target: 2000000,
      current: 1200000,
      deadline: '2024-08-15',
      color: '#10b981',
      icon: 'airplane'
    },
    {
      id: '3',
      title: 'Mua nhà',
      target: 50000000,
      current: 15000000,
      deadline: '2025-12-31',
      color: '#f59e0b',
      icon: 'home'
    },
    {
      id: '4',
      title: 'MacBook Pro',
      target: 2500000,
      current: 500000,
      deadline: '2024-06-30',
      color: '#8b5cf6',
      icon: 'laptop'
    },
  ];

  const getProgress = (current: number, target: number) => {
    return Math.min(current / target, 1);
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mục tiêu</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tiến độ mục tiêu</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã tiết kiệm</Text>
              <Text style={styles.summaryValue}>22,000,000 VND</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mục tiêu</Text>
              <Text style={styles.summaryValue}>54,500,000 VND</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Hoàn thành</Text>
              <Text style={[styles.summaryValue, { color: '#10b981' }]}>40%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Các mục tiêu của bạn</Text>

        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                  <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalProgress}>
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} VND
                  </Text>
                </View>
              </View>
              <View style={styles.goalRight}>
                <Text style={[styles.goalPercentage, { color: goal.color }]}>
                  {Math.round(getProgress(goal.current, goal.target) * 100)}%
                </Text>
                <Text style={styles.goalDays}>
                  {getDaysLeft(goal.deadline)} ngày
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              {Platform.OS === 'android' ? (
                <ProgressBarAndroid
                  styleAttr="Horizontal"
                  indeterminate={false}
                  progress={getProgress(goal.current, goal.target)}
                  color={goal.color}
                  style={styles.progressBar}
                />
              ) : (
                <View style={styles.progressBarIOS}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgress(goal.current, goal.target) * 100}%`,
                        backgroundColor: goal.color
                      }
                    ]}
                  />
                </View>
              )}
            </View>

            <View style={styles.goalFooter}>
              <Text style={styles.goalRemaining}>
                Còn cần: {(goal.target - goal.current).toLocaleString()} VND
              </Text>
              <Text style={styles.goalDeadline}>
                Hạn: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addGoalButton}>
          <Ionicons name="trophy" size={20} color="#fff" />
          <Text style={styles.addGoalButtonText}>Thêm mục tiêu mới</Text>
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
  goalCard: {
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
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 12,
    color: "#666",
  },
  goalRight: {
    alignItems: "flex-end",
  },
  goalPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  goalDays: {
    fontSize: 12,
    color: "#666",
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
  },
  progressBarIOS: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalRemaining: {
    fontSize: 12,
    color: "#666",
  },
  goalDeadline: {
    fontSize: 12,
    color: "#666",
  },
  addGoalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    height: 50,
    marginTop: 10,
  },
  addGoalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});