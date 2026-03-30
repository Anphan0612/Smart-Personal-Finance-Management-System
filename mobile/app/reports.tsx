import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";

export default function ReportsScreen() {
  const router = useRouter();

  const reportTypes = [
    {
      id: '1',
      title: 'Báo cáo thu nhập',
      subtitle: 'Theo dõi nguồn thu nhập',
      icon: 'trending-up',
      color: '#10b981',
      value: '+$3,450.00'
    },
    {
      id: '2',
      title: 'Báo cáo chi tiêu',
      subtitle: 'Phân tích chi tiêu theo danh mục',
      icon: 'trending-down',
      color: '#ef4444',
      value: '-$317.99'
    },
    {
      id: '3',
      title: 'Báo cáo tiết kiệm',
      subtitle: 'Tiến độ đạt mục tiêu',
      icon: 'wallet',
      color: '#3b82f6',
      value: '85%'
    },
    {
      id: '4',
      title: 'Báo cáo ngân sách',
      subtitle: 'So sánh với kế hoạch',
      icon: 'pie-chart',
      color: '#f59e0b',
      value: '92%'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo</Text>
        <TouchableOpacity>
          <Ionicons name="calendar" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan tháng này</Text>
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Thu nhập</Text>
              <Text style={[styles.statValue, { color: '#10b981' }]}>+$3,450.00</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Chi tiêu</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>-$317.99</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Tiết kiệm</Text>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>+$3,132.01</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Chi tiết báo cáo</Text>

        {reportTypes.map((report) => (
          <TouchableOpacity key={report.id} style={styles.reportCard}>
            <View style={styles.reportLeft}>
              <View style={[styles.reportIcon, { backgroundColor: report.color + '20' }]}>
                <Ionicons name={report.icon as any} size={24} color={report.color} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportSubtitle}>{report.subtitle}</Text>
              </View>
            </View>
            <View style={styles.reportRight}>
              <Text style={[styles.reportValue, { color: report.color }]}>
                {report.value}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Xuất báo cáo PDF</Text>
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
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  reportCard: {
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
  reportLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reportIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  reportRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    height: 50,
    marginTop: 20,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});