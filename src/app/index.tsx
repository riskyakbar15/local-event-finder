import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, Spacing } from "@/constants/theme";
import EventsList from "@/features/events/EventsList";

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const topPad = Platform.OS === "android" ? safeAreaInsets.top : Spacing.three;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <EventsList
        nearMeOnly
        showCategoryFilter={false}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title">Events near you</ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              Discover what&apos;s happening around your location.
            </ThemedText>
            <Pressable
              onPress={() => router.push("/create-event")}
              style={styles.cta}
              accessibilityRole="button"
              accessibilityLabel="Create a new event"
            >
              <ThemedText type="link">+ Create event</ThemedText>
            </Pressable>
          </ThemedView>
        }
      />
      {Platform.OS === "web" && <WebBadge />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: BottomTabInset,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  cta: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
  },
});
