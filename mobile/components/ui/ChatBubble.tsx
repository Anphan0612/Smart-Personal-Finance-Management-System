import React, {useState} from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
}

const initialMessages: Message[] = [
  { id: '1', from: 'bot', text: 'Chào bạn! Tôi có thể giúp gì hôm nay?' },
];

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    setTimeout(() => {
      let reply = 'Xin lỗi, tôi chưa hiểu. Xin vui lòng thử lại.';
      const lt = userMsg.text.toLowerCase();
      if (lt.includes('tiền') || lt.includes('giao dịch')) {
        reply = 'Bạn muốn quản lý chi tiêu hay thu nhập?';
      } else if (lt.includes('nợp') || lt.includes('lịch')) {
        reply = 'Bạn có thể vào mục lịch sử để xem tất cả giao dịch.';
      } else if (lt.includes('hiên') || lt.includes('state')) {
        reply = 'App đang chạy ổn định. Bạn cần feature gì thêm không?';
      }
      const botMsg: Message = { id: `${Date.now()}-bot`, from: 'bot', text: reply };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Text style={styles.fabText}>💬</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Chatbot hỗ trợ</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Text style={styles.close}>Đóng</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.messageRow, item.from === 'user' ? styles.userRow : styles.botRow]}>
                    <View style={[styles.messageBubble, item.from === 'user' ? styles.userBubble : styles.botBubble]}>
                      <Text style={item.from === 'user' ? styles.userText : styles.botText}>{item.text}</Text>
                    </View>
                  </View>
                )}
              />

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Nhập tin nhắn..."
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Text style={styles.sendText}>Gửi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  modalContainer: {
    height: '65%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  messageRow: {
    marginVertical: 4,
    marginHorizontal: 6,
  },
  botRow: {
    alignItems: 'flex-start',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
  },
  botBubble: {
    backgroundColor: '#f3f4f6',
  },
  userBubble: {
    backgroundColor: '#3b82f6',
  },
  botText: {
    color: '#111827',
  },
  userText: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
