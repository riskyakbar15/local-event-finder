import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { EVENT_CATEGORIES } from "@/features/events/categories";
import useEvents, { EventItem } from "@/features/events/useEvents";
import { useLocation } from "@/features/location/useLocation";
import { useTheme } from "@/hooks/use-theme";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

type Props = {
  /** When true, only show events within radiusMeters of the current location. */
  nearMeOnly?: boolean;
  radiusMeters?: number;
  showCategoryFilter?: boolean;
  ListHeaderComponent?: React.ComponentProps<
    typeof FlatList
  >["ListHeaderComponent"];
};

function formatStartAt(startAt?: string) {
  if (!startAt) return null;
  const d = new Date(startAt);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

export default function EventsList({
  nearMeOnly = false,
  radiusMeters = 5000,
  showCategoryFilter = true,
  ListHeaderComponent,
}: Props) {
  const theme = useTheme();
  const { location } = useLocation(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const center =
    nearMeOnly && location?.coords
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : undefined;

  const { events } = useEvents(center ? { center, radiusMeters } : undefined);

  const filtered = useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const renderItem: ListRenderItem<EventItem> = ({ item }) => {
    const start = formatStartAt(item.startAt);
    return (
      <ThemedView
        type="backgroundElement"
        style={styles.card}
        accessibilityRole="summary"
        accessibilityLabel={`Event ${item.title}`}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : null}
        <View style={styles.cardBody}>
          <ThemedText type="subtitle" numberOfLines={2}>
            {item.title}
          </ThemedText>
          {item.category ? (
            <ThemedText type="small" themeColor="textSecondary">
              {item.category}
            </ThemedText>
          ) : null}
          {start ? (
            <ThemedText type="small" themeColor="textSecondary">
              {start}
            </ThemedText>
          ) : null}
          {item.description ? (
            <ThemedText type="default" numberOfLines={3}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    );
  };

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent as React.ReactNode}
          {showCategoryFilter ? (
            <View style={styles.chips}>
              <Pressable
                onPress={() => setSelectedCategory(null)}
                style={[
                  styles.chip,
                  { borderColor: theme.backgroundSelected },
                  !selectedCategory && {
                    backgroundColor: theme.backgroundSelected,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: !selectedCategory }}
              >
                <ThemedText type="small">All</ThemedText>
              </Pressable>
              {EVENT_CATEGORIES.map((c) => {
                const selected = c === selectedCategory;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setSelectedCategory(c)}
                    style={[
                      styles.chip,
                      { borderColor: theme.backgroundSelected },
                      selected && {
                        backgroundColor: theme.backgroundSelected,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Filter ${c}`}
                  >
                    <ThemedText type="small">{c}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <ThemedText type="subtitle">No events yet</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {nearMeOnly
              ? "There are no events near you right now."
              : "Be the first to create an event."}
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: 160 },
  cardBody: { padding: Spacing.three, gap: Spacing.one },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
});
