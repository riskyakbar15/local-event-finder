import { db } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  organizerId?: string;
  location?: { latitude: number; longitude: number };
  startAt?: string;
};

export const useEvents = (opts?: {
  center?: { latitude: number; longitude: number };
  radiusMeters?: number; // radius in meters
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const col = collection(db, "events");

    const { center, radiusMeters } = opts ?? {};

    // If center provided, compute bounding box to reduce server-side results.
    let q;
    if (center && radiusMeters && isFinite(radiusMeters) && radiusMeters > 0) {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;
      const earth = 6371000; // meters
      const lat = center.latitude;
      const lng = center.longitude;
      const latDelta = toDeg(radiusMeters / earth);
      const lngDelta = toDeg(radiusMeters / earth / Math.cos(toRad(lat)));

      const minLat = lat - latDelta;
      const maxLat = lat + latDelta;
      const minLng = lng - lngDelta;
      const maxLng = lng + lngDelta;

      // Server-side bounding box where filters — note: Firestore may require a composite index for
      // multiple range filters on different fields. If index is missing Firestore will return an error
      // with a direct link to create the required index.
      q = query(
        col,
        where("location.latitude", ">=", minLat),
        where("location.latitude", "<=", maxLat),
        where("location.longitude", ">=", minLng),
        where("location.longitude", "<=", maxLng),
        orderBy("createdAt", "desc"),
      );
    } else {
      q = query(col, orderBy("createdAt", "desc"));
    }

    const haversine = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371000; // metres
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const unsub = onSnapshot(q, (snap) => {
      const items: EventItem[] = snap.docs
        .map((doc) => {
          const data = doc.data() as any;
          const loc = data.location;
          return {
            id: doc.id,
            title: data.title ?? "Untitled",
            description: data.description,
            category: data.category,
            organizerId: data.organizerId,
            location: loc
              ? { latitude: loc.latitude, longitude: loc.longitude }
              : undefined,
            startAt: data.startAt ?? undefined,
          } as EventItem;
        })
        .filter(Boolean);

      // If center provided, apply precise Haversine filter client-side to ensure radius
      let filtered = items;
      if (center && radiusMeters && radiusMeters > 0) {
        filtered = items.filter((it) => {
          if (!it.location) return false;
          const d = haversine(
            center.latitude,
            center.longitude,
            it.location.latitude,
            it.location.longitude,
          );
          return d <= radiusMeters;
        });
      }

      setEvents(filtered);
    });

    return () => unsub();
  }, [opts?.center?.latitude, opts?.center?.longitude, opts?.radiusMeters]);

  return { events };
};

export default useEvents;
