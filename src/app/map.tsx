import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '@/features/location/useLocation';

export default function MapScreen() {
  const { location, errorMsg } = useLocation(true);
  const [userRegion, setUserRegion] = useState<Region | null>(null);

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

  const markers = useMemo(() => {
    // Placeholder: events will be loaded from Firestore later.
    // For now show only user location as a marker.
    if (!userRegion) return [] as { id: string; latitude: number; longitude: number; title: string }[];
    return [
      { id: 'me', latitude: userRegion.latitude, longitude: userRegion.longitude, title: 'You are here' },
    ];
  }, [userRegion]);

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
      <MapView style={styles.map} initialRegion={userRegion} region={userRegion} showsUserLocation={true}>
        {markers.map((m) => (
          <Marker key={m.id} coordinate={{ latitude: m.latitude, longitude: m.longitude }} title={m.title} />
        ))}
      </MapView>

      <View style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // recenter to current location
            if (userRegion) setUserRegion({ ...userRegion });
          }}>
          <Text style={styles.fabText}>Center</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fabContainer: { position: 'absolute', right: 16, bottom: 24 },
  fab: { backgroundColor: '#1a73e8', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 24 },
  fabText: { color: 'white', fontWeight: '600' },
});
