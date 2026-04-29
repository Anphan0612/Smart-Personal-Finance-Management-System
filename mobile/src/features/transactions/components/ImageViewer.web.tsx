import React from 'react';
import { Modal, View, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';

interface ImageViewerProps {
  images: { uri: string; headers?: any }[];
  visible: boolean;
  onRequestClose: () => void;
}

export const ImageViewer = ({ images, visible, onRequestClose }: ImageViewerProps) => {
  if (!images || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onRequestClose}
          style={{ position: 'absolute', top: 40, right: 20, zIndex: 1, padding: 10 }}
        >
          <X color="white" size={30} />
        </TouchableOpacity>
        <Image
          source={images[0]}
          style={{ width: '90%', height: '80%' }}
          contentFit="contain"
        />
      </View>
    </Modal>
  );
};
