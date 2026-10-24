import { useEffect, useState } from "react";

// Gets the user's current position once, when the page opens
export default function useGeolocation() {
  const [state, setState] = useState({ coords: null, error: "", loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: "Your browser does not support location.", loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          coords: { lat: position.coords.latitude, lon: position.coords.longitude },
          error: "",
          loading: false,
        }),
      () =>
        setState({
          coords: null,
          error: "Location permission denied. Please allow location access and refresh.",
          loading: false,
        })
    );
  }, []);

  return state;
}
