import useEvents from "@/features/events/useEvents";
import { useLocation } from "@/features/location/useLocation";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";

export default function MapScreen() {
  const { location, errorMsg, refreshLocation, refreshing } = useLocation(true);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (location?.coords) {
      const { latitude, longitude } = location.coords;
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setUserRegion(region);
    }
  }, [location]);

  const { events } = useEvents({
    center: userRegion
      ? { latitude: userRegion.latitude, longitude: userRegion.longitude }
      : undefined,
    radiusMeters: 5000,
  });

  const markers = useMemo(() => {
    const list: {
      id: string;
      latitude: number;
      longitude: number;
      title: string;
    }[] = [];
    if (userRegion) {
      list.push({
        id: "me",
        latitude: userRegion.latitude,
        longitude: userRegion.longitude,
        title: "You are here",
      });
    }
    events.forEach((e) => {
      if (e.location) {
        list.push({
          id: e.id,
          latitude: e.location.latitude,
          longitude: e.location.longitude,
          title: e.title,
        });
      }
    });
    return list;
  }, [userRegion, events]);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!userRegion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Mendapatkan lokasi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={userRegion}
        region={userRegion}
        showsUserLocation={true}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
          >
            <Callout>
              <View style={{ width: 200 }}>
                <Text style={{ fontWeight: "700" }}>{m.title}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, refreshing ? { opacity: 0.7 } : undefined]}
          onPress={() => {
            // refresh and recenter using the latest location
            void refreshLocation();
          }}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.fabText}>Center</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { marginTop: 12, backgroundColor: "#24A148" }]}
          onPress={() => {
            // navigate to create-event route (cast to any to satisfy typed router union)
            router.push({ pathname: "/create-event" } as any);
          }}
        >
          <Text style={styles.fabText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fabContainer: { position: "absolute", right: 16, bottom: 24 },
  fab: {
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  fabText: { color: "white", fontWeight: "600" },
});
