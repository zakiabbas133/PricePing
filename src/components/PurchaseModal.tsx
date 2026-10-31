import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PurchaseModal = ({
  setPurchaseModal,
  purchaseMessage,
  onPurchaseModalClose,
}: {
  setPurchaseModal: (val: boolean) => void;
  purchaseMessage: {
    title: string;
    message: string;
    successWarnOrError: number;
  };
  onPurchaseModalClose: () => void;
}) => {
  const status = purchaseMessage?.successWarnOrError;

  const statusColor =
    status === 1 ? "#16A34A" : status === 2 ? "#CFBD19" : "#D61D2D";

  const iconName =
    status === 1
      ? "checkmark"
      : status === 2
        ? "warning-outline"
        : "close-circle-outline";

  const handleClose = () => {
    setPurchaseModal(false);
    onPurchaseModalClose();
  };

  const modalContent = (
    <>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setPurchaseModal(false)}
      />
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: statusColor }]}>
          <Ionicons name={iconName} size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>{purchaseMessage?.title}</Text>
        <Text style={styles.message}>{purchaseMessage?.message}</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              { backgroundColor: statusColor },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.confirmText}>Okay</Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => setPurchaseModal(false)}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={20} style={styles.overlay}>
          {modalContent}
        </BlurView>
      ) : (
        <View
          style={[
            styles.overlay,
            { backgroundColor: "rgba(15, 23, 42, 0.55)" },
          ]}
        >
          {modalContent}
        </View>
      )}
    </Modal>
  );
};

export default PurchaseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
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

  confirmButton: {
    backgroundColor: "#1677FF",
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
