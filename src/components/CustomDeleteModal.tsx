import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CustomDeleteModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const CustomDeleteModal = ({
  visible,
  title = "Delete Alarm?",
  message = "Are you sure you want to delete this alarm? This action cannot be undone.",
  onCancel,
  onConfirm,
  loading = false,
}: CustomDeleteModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={30}
              color="#D92D20"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressedButton,
                loading && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={17}
                    color="#FFFFFF"
                  />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDeleteModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 21,
    color: "#101828",
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },

  message: {
    fontSize: 14,
    lineHeight: 22,
    color: "#667085",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 26,
    fontFamily: "Outfit-Medium",
  },

  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 15,
    color: "#344054",
    fontFamily: "Outfit-Bold",
  },

  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#D92D20",
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "Outfit-Bold",
  },

  pressedButton: {
    opacity: 0.8,
  },

  disabledButton: {
    opacity: 0.6,
  },
});
