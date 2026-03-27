import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userName');
              await AsyncStorage.removeItem('userPhone');
              router.replace('/login');
            } catch (error) {
              console.error('Lỗi đăng xuất:', error);
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Tài khoản',
      items: [
        { id: '1', title: 'Thông tin cá nhân', icon: 'person', action: 'profile' },
        { id: '2', title: 'Bảo mật', icon: 'shield-checkmark', action: 'security' },
        { id: '3', title: 'Ngân hàng liên kết', icon: 'card', action: 'banks' },
      ]
    },
    {
      title: 'Thông báo',
      items: [
        { id: '4', title: 'Thông báo giao dịch', icon: 'notifications', type: 'toggle', value: true },
        { id: '5', title: 'Nhắc nhở ngân sách', icon: 'wallet', type: 'toggle', value: true },
        { id: '6', title: 'Cập nhật mục tiêu', icon: 'trophy', type: 'toggle', value: false },
      ]
    },
    {
      title: 'Giao diện',
      items: [
        { id: '7', title: 'Chế độ tối', icon: 'moon', type: 'toggle', value: false },
        { id: '8', title: 'Ngôn ngữ', icon: 'language', action: 'language' },
        { id: '9', title: 'Đơn vị tiền tệ', icon: 'cash', action: 'currency' },
      ]
    },
    {
      title: 'Hỗ trợ',
      items: [
        { id: '10', title: 'Trợ giúp', icon: 'help-circle', action: 'help' },
        { id: '11', title: 'Liên hệ', icon: 'mail', action: 'contact' },
        { id: '12', title: 'Về ứng dụng', icon: 'information-circle', action: 'about' },
      ]
    },
  ];

  const handleSettingPress = (action: string) => {
    // Handle different setting actions
    console.log('Setting pressed:', action);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={() => item.action && handleSettingPress(item.action)}
                disabled={item.type === 'toggle'}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                </View>

                <View style={styles.settingRight}>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={() => {}}
                      trackColor={{ false: '#ccc', true: '#3b82f6' }}
                      thumbColor="#fff"
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/login')}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Smart Finance</Text>
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
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
  },
  settingRight: {
    marginLeft: 10,
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999",
  },
});