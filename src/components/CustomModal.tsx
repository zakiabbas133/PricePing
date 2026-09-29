import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  children?: React.ReactNode;
  closeOnBackdrop?: boolean;
  cardStyle?: ViewStyle;
};

const CustomModal = ({
  visible,
  onClose,
  title = "Notice",
  message,
  icon = "information-outline",
  iconColor = "#1677FF",
  confirmText = "Got it",
  cancelText = "Cancel",
  onConfirm,
  showCancel = false,
  children,
  closeOnBackdrop = true,
  cardStyle,
}: CustomModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeOnBackdrop ? onClose : undefined}
        />

        <View style={[styles.card, cardStyle]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${iconColor}15` },
            ]}
          >
            <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {children}

          <View style={styles.buttonContainer}>
            {showCancel && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onConfirm ?? onClose}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                { backgroundColor: iconColor },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 21,
    color: "#101828",
    fontFamily: "Outfit-SemiBold",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    lineHeight: 23,
    color: "#667085",
    fontFamily: "Outfit-Regular",
    textAlign: "center",
    marginBottom: 26,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#EAECF0",
  },
  confirmButton: {
    backgroundColor: "#1677FF",
  },
  cancelText: {
    fontSize: 15,
    color: "#344054",
    fontFamily: "Outfit-SemiBold",
  },
  confirmText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "Outfit-SemiBold",
  },
  pressed: {
    opacity: 0.8,
  },
});
