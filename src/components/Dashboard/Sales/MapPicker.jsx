import React, { useState, useCallback } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px"
};

const defaultCenter = {
  lat: 19.076,  // fallback coords (Mumbai)
  lng: 72.8777
};

function MapPicker({ lat, lng, onChange }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API
  });

  const [markerPos, setMarkerPos] = useState({
    lat: lat || defaultCenter.lat,
    lng: lng || defaultCenter.lng
  });

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPos({ lat, lng });
    onChange({ lat, lng });
  }, [onChange]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPos}
      zoom={11}
      onClick={onMapClick}
    >
      <MarkerF position={markerPos} />
    </GoogleMap>
  );
}

export default React.memo(MapPicker);
