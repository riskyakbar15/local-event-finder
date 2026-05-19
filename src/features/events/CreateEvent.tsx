import { db, storage } from "@/config/firebase";
import { useAuth } from "@/features/auth/useAuth";
import { useLocation } from "@/features/location/useLocation";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateEvent() {
  const { user } = useAuth();
  const { location } = useLocation(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Permission to access photos is required to attach an image.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("image pick error", e);
    }
  };

  const submit = async () => {
    if (!user)
      return Alert.alert(
        "Sign in required",
        "Please sign in to create an event.",
      );
    if (!title) return Alert.alert("Validation", "Title is required.");
    if (!db || !storage) {
      return Alert.alert(
        "Firebase setup required",
        "Add Firebase credentials before creating events.",
      );
    }

    const loc = location?.coords
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null;

    try {
      setUploading(true);
      let imageUrl: string | null = null;
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const path = `events/${user.uid}/${Date.now()}.jpg`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, blob);
        imageUrl = await getDownloadURL(ref);
      }

      await addDoc(collection(db, "events"), {
        title,
        description,
        organizerId: user.uid,
        location: loc,
        imageUrl,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setImageUri(null);
      Alert.alert("Success", "Event created");
    } catch (e) {
      console.error("create event error", e);
      Alert.alert("Error", "Failed to create event");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Event title"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
      />

      <Button title="Pick Image (optional)" onPress={pickImage} />
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: "100%",
            height: 180,
            marginVertical: 12,
            borderRadius: 8,
          }}
        />
      ) : null}
      <Button
        title={
          uploading ? "Creating..." : "Create Event (uses current location)"
        }
        onPress={submit}
        disabled={uploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  label: { marginBottom: 6, fontWeight: "600" },
});
