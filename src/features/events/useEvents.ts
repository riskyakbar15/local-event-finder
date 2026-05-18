import { db } from "@/config/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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

export const useEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    const col = collection(db, "events");
    // simple query — listen to all events; later can add geo filtering
    const q = query(col, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items: EventItem[] = snap.docs.map((doc) => {
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
        };
      });
      setEvents(items);
    });
    return () => unsub();
  }, []);

  return { events };
};

export default useEvents;
