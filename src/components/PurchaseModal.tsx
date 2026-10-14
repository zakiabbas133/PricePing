import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => setPurchaseModal(false)}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setPurchaseModal(false)}
        />

        <View style={[styles.card]}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  purchaseMessage?.successWarnOrError == 1
                    ? "#16A34A"
                    : purchaseMessage?.successWarnOrError == 2
                      ? "#cfbd19"
                      : "#d61d2d",
              },
            ]}
          >
            <Ionicons
              name={
                purchaseMessage?.successWarnOrError == 1
                  ? "checkmark"
                  : purchaseMessage?.successWarnOrError == 2
                    ? "warning-outline"
                    : "close-circle-outline"
              }
              size={32}
              color={"#fff"}
            />
          </View>

          <Text style={styles.title}>{purchaseMessage?.title}</Text>

          <Text style={styles.message}>{purchaseMessage?.message}</Text>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => {
                setPurchaseModal(false);
                onPurchaseModalClose();
              }}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor:
                    purchaseMessage?.successWarnOrError == 1
                      ? "#16A34A"
                      : purchaseMessage?.successWarnOrError == 2
                        ? "#cfbd19"
                        : "#d61d2d",
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.confirmText}>Okay</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default PurchaseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: "rgba(15, 23, 42, 0.55)",
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
