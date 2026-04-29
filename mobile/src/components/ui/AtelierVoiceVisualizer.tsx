import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Mic, X, ShieldAlert } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import * as Haptics from 'expo-haptics';
import { AtelierTypography } from './AtelierTypography';

interface AtelierVoiceVisualizerProps {
  onTranscriptionResult: (text: string) => void;
  onClose: () => void;
}

export const AtelierVoiceVisualizer = ({
  onTranscriptionResult,
  onClose,
}: AtelierVoiceVisualizerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  // Simulated waves
  const [waves] = useState([1, 2, 3, 4, 5, 6, 7]);

  const requestPermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Real implementation would use: const { status } = await Audio.requestPermissionsAsync();
    // Here we simulate successful permission
    setTimeout(() => {
      setHasPermission(true);
      startRecording();
    }, 500);
  };

  const startRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(true);

    // Simulate real-time transcription
    const currentText = 'Đang nghe';
    setTranscription(currentText + '...');

    setTimeout(() => setTranscription('Thêm giao dịch...'), 1500);
    setTimeout(() => setTranscription('Thêm giao dịch ăn trưa...'), 2500);
    setTimeout(() => setTranscription('Thêm giao dịch ăn trưa 50 ngàn...'), 3500);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRecording(false);

    // Send the simulated result
    setTimeout(() => {
      onTranscriptionResult('Thêm giao dịch ăn trưa 50 ngàn');
      onClose();
    }, 500);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-surface-container-high rounded-t-[32px] p-6 shadow-2xl z-50 border-t border-surface-container-highest"
    >
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center gap-2">
          <Mic size={20} color={isRecording ? '#ba1a1a' : '#005ab4'} />
          <AtelierTypography variant="h3" className="text-[16px] text-surface-on">
            {isRecording ? 'Đang lắng nghe...' : 'Trợ lý giọng nói'}
          </AtelierTypography>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (isRecording) stopRecording();
            else onClose();
          }}
          className="w-8 h-8 rounded-full bg-surface-container-highest items-center justify-center"
        >
          <X size={16} color="#414753" />
        </TouchableOpacity>
      </View>

      {hasPermission === null && (
        <View className="items-center py-6">
          <View className="w-16 h-16 rounded-full bg-primary-container items-center justify-center mb-4">
            <ShieldAlert size={28} color="#005ab4" />
          </View>
          <AtelierTypography variant="h3" className="text-center text-[16px] mb-2 text-surface-on">
            Cần quyền Microphone
          </AtelierTypography>
          <AtelierTypography
            variant="body"
            className="text-center text-[13px] text-surface-on-variant px-4 mb-8"
          >
            Atelier AI cần quyền truy cập microphone để có thể nhận diện giọng nói của bạn. Dữ liệu
            âm thanh sẽ không được lưu trữ.
          </AtelierTypography>
          <TouchableOpacity
            onPress={requestPermission}
            className="w-full py-4 bg-primary rounded-2xl items-center"
          >
            <AtelierTypography variant="label" className="text-white text-[14px] font-bold">
              Cấp quyền ngay
            </AtelierTypography>
          </TouchableOpacity>
        </View>
      )}

      {hasPermission === true && (
        <View className="items-center py-8">
          <AtelierTypography
            variant="h2"
            className={`text-center text-[24px] font-medium mb-12 ${transcription ? 'text-surface-on' : 'text-surface-on-variant opacity-50'}`}
          >
            {transcription || 'Hãy nói gì đó...'}
          </AtelierTypography>

          <View className="flex-row items-center justify-center gap-2 mb-10 h-16">
            {waves.map((w, index) => (
              <MotiView
                key={index}
                from={{ height: 10, opacity: 0.5 }}
                animate={{
                  height: isRecording ? 10 + Math.random() * 40 : 10,
                  opacity: isRecording ? 1 : 0.5,
                }}
                transition={{
                  type: 'timing',
                  duration: 200 + Math.random() * 200,
                  loop: isRecording,
                }}
                className={`w-2 rounded-full ${isRecording ? 'bg-primary' : 'bg-surface-container-highest'}`}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full items-center justify-center shadow-lg ${isRecording ? 'bg-error' : 'bg-primary'}`}
          >
            <Mic size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </MotiView>
  );
};
