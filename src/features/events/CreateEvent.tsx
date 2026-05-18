import { db } from "@/config/firebase";
import { useAuth } from "@/features/auth/useAuth";
import { useLocation } from "@/features/location/useLocation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function CreateEvent() {
  const { user } = useAuth();
  const { location } = useLocation(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!user)
      return Alert.alert(
        "Sign in required",
        "Please sign in to create an event.",
      );
    if (!title) return Alert.alert("Validation", "Title is required.");
    const loc = location?.coords
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null;

    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        organizerId: user.uid,
        location: loc,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      Alert.alert("Success", "Event created");
    } catch (e) {
      console.error("create event error", e);
      Alert.alert("Error", "Failed to create event");
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

      <Button title="Create Event (uses current location)" onPress={submit} />
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
