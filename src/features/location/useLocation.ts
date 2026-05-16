import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const last = await Location.getLastKnownPositionAsync();
        if (mounted && last) setLocation(last);

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (mounted && current) setLocation(current);

        if (watch) {
          subscriptionRef.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
            (pos) => {
              if (mounted) setLocation(pos);
            },
          );
        }
      } catch (e) {
        console.error("useLocation error", e);
        setErrorMsg(String(e));
      }
    })();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [watch]);

  return { location, errorMsg };
};
