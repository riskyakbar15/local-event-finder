import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

export type LocationState = {
  coords?: Location.LocationObjectCoords | null;
  timestamp?: number | null;
};

export const useLocation = (watch = true) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mountedRef = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshLocation = useCallback(async () => {
    setRefreshing(true);
    try {
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const last = await Location.getLastKnownPositionAsync();
      if (mountedRef.current && last) setLocation(last);

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      if (mountedRef.current && current) setLocation(current);

      if (watch) {
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }

        subscriptionRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
          (pos) => {
            if (mountedRef.current) setLocation(pos);
          },
        );
      }
    } catch (e) {
      console.error("useLocation error", e);
      setErrorMsg(String(e));
    } finally {
      setRefreshing(false);
    }
  }, [watch]);

  useEffect(() => {
    mountedRef.current = true;
    void refreshLocation();

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [refreshLocation]);

  return { location, errorMsg, refreshLocation, refreshing };
};
