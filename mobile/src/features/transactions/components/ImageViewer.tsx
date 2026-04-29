import React from 'react';
import ImageView from 'react-native-image-viewing';

interface ImageViewerProps {
  images: { uri: string; headers?: any }[];
  visible: boolean;
  onRequestClose: () => void;
}

export const ImageViewer = ({ images, visible, onRequestClose }: ImageViewerProps) => {
  return (
    <ImageView
      images={images}
      imageIndex={0}
      visible={visible}
      onRequestClose={onRequestClose}
    />
  );
};
