import React from "react";
import { View, TouchableOpacity, Dimensions, StyleSheet, Pressable } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { AtelierTypography } from "./AtelierTypography";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AtelierActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  title?: string;
  subtitle?: string;
}

export const AtelierActionSheet = ({
  isVisible,
  onClose,
  onSelectCamera,
  onSelectGallery,
  title = "Nguồn biên lai",
  subtitle = "Chọn cách bạn muốn thêm giao dịch mới"
}: AtelierActionSheetProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <View key="atelier-action-sheet" style={styles.container} pointerEvents="box-none">
          {/* Backdrop */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onTouchStart={onClose}
          />

          {/* Sheet */}
          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={styles.sheet}
          >
            {/* Handle Bar */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.content}>
              <View style={styles.header}>
                <AtelierTypography variant="h3" className="text-xl text-surface-on">
                  {title}
                </AtelierTypography>
                <AtelierTypography variant="label" className="text-surface-on-variant mt-1">
                  {subtitle}
                </AtelierTypography>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  onPress={onSelectCamera}
                  style={styles.optionButton}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: "#EBF3FF" }]}>
                    <Camera size={24} color="#005ab4" strokeWidth={1.5} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <AtelierTypography variant="h3" className="text-base text-surface-on">
                      Chụp ảnh mới
                    </AtelierTypography>
                    <AtelierTypography variant="label" className="text-xs text-surface-on-variant">
                      Sử dụng camera để quét hóa đơn trực tiếp
                    </AtelierTypography>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSelectGallery}
                  style={styles.optionButton}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: "#F0F0F0" }]}>
                    <ImageIcon size={24} color="#444" strokeWidth={1.5} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <AtelierTypography variant="h3" className="text-base text-surface-on">
                      Từ thư viện
                    </AtelierTypography>
                    <AtelierTypography variant="label" className="text-xs text-surface-on-variant">
                      Chọn ảnh hóa đơn đã có sẵn trong máy
                    </AtelierTypography>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <AtelierTypography variant="h3" className="text-sm text-surface-on-variant uppercase tracking-widest">
                  Hủy bỏ
                </AtelierTypography>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20000,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 28,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFE",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F0F4F8",
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  cancelButton: {
    marginTop: 24,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
