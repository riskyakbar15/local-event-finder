import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, Spacing } from "@/constants/theme";
import EventsList from "@/features/events/EventsList";

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const topPad = Platform.OS === "android" ? safeAreaInsets.top : Spacing.three;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <EventsList
        showCategoryFilter
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">Explore</ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              Browse events and filter by category.
            </ThemedText>
          </View>
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
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
});
