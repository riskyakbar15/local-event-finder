import useEvents from "@/features/events/useEvents";
import { useLocation } from "@/features/location/useLocation";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";

export default function MapScreen() {
  const { location, errorMsg, refreshLocation, refreshing } = useLocation(true);
  const [userRegion, setUserRegion] = useState<Region | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLng, setManualLng] = useState<string>("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(5000);
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
    radiusMeters,
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

  if (!userRegion) {
    return (
      <View style={styles.center}>
        {errorMsg ? (
          <Text style={styles.statusText}>{errorMsg}</Text>
        ) : (
          <>
            <ActivityIndicator />
            <Text style={styles.statusText}>Mendapatkan lokasi...</Text>
          </>
        )}

        {errorMsg ? (
          <TouchableOpacity
            style={[styles.fab, { marginBottom: 8 }]}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.fabText}>Open Location Settings</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.fab, { marginBottom: 8 }]}
          onPress={() => setShowManualForm((s) => !s)}
        >
          <Text style={styles.fabText}>
            {showManualForm ? "Cancel" : "Set Manual Location"}
          </Text>
        </TouchableOpacity>

        {showManualForm ? (
          <View style={styles.manualForm}>
            <TextInput
              placeholder="Latitude"
              keyboardType="numeric"
              value={manualLat}
              onChangeText={setManualLat}
              style={styles.input}
            />
            <TextInput
              placeholder="Longitude"
              keyboardType="numeric"
              value={manualLng}
              onChangeText={setManualLng}
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.fab, { marginTop: 8 }]}
              onPress={() => {
                const lat = parseFloat(manualLat);
                const lng = parseFloat(manualLng);
                if (isNaN(lat) || isNaN(lng)) {
                  setManualError(
                    "Enter valid numbers for latitude and longitude.",
                  );
                  return;
                }
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                  setManualError(
                    "Latitude must be -90..90 and longitude -180..180.",
                  );
                  return;
                }
                setManualError(null);
                const region: Region = {
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                };
                setUserRegion(region);
              }}
            >
              <Text style={styles.fabText}>Use Manual Location</Text>
            </TouchableOpacity>
            {manualError ? (
              <Text style={styles.errorText}>{manualError}</Text>
            ) : null}
          </View>
        ) : null}
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

      {events.length === 0 ? (
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText}>
            No events within {Math.round(radiusMeters / 1000)} km. Try a larger
            radius or add one.
          </Text>
        </View>
      ) : null}

      <View style={styles.radiusContainer} pointerEvents="box-none">
        {[2000, 5000, 10000].map((r) => {
          const active = r === radiusMeters;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRadiusMeters(r)}
              style={[styles.radiusChip, active && styles.radiusChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Search radius ${r / 1000} kilometers`}
            >
              <Text
                style={[
                  styles.radiusChipText,
                  active && styles.radiusChipTextActive,
                ]}
              >
                {r / 1000} km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
            router.push("/create-event");
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
  statusText: { marginBottom: 8, marginTop: 8, textAlign: "center" },
  manualForm: { width: "90%", marginTop: 12 },
  fabContainer: { position: "absolute", right: 16, bottom: 24 },
  radiusContainer: {
    position: "absolute",
    left: 16,
    bottom: 24,
    flexDirection: "row",
    gap: 8,
  },
  radiusChip: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  radiusChipActive: { backgroundColor: "#1a73e8", borderColor: "#1a73e8" },
  radiusChipText: { color: "#333", fontWeight: "600" },
  radiusChipTextActive: { color: "white" },
  banner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bannerText: { color: "white", textAlign: "center" },
  errorText: { color: "#d32f2f", marginTop: 8 },
  fab: {
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  fabText: { color: "white", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    width: "100%",
  },
});
