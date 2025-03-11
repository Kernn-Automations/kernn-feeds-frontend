import React, { useRef, useState } from "react";
import { GoogleMap, MarkerF, StandaloneSearchBox } from "@react-google-maps/api";

function GoogleMapLocator() {
  const containerStyle = {
    width: "100%",
    height: "500px",
  };

  const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Default location (New York)

  const [location, setLocation] = useState(defaultCenter); // Center of the map and marker position
  const searchBoxRef = useRef(null);

  // Handle when the user selects a location from the search box
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      const newLocation = {
        lat: location.lat(),
        lng: location.lng(),
      };
      setLocation(newLocation); // Update the map center and marker position
    }
  };

  // Initialize the search box reference
  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 🔹 Search Input Box */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a location"
            style={{
              width: "300px",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
              outline: "none",
              zIndex: 1000,
            }}
          />
        </StandaloneSearchBox>
      </div>

      {/* 🔹 Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location}
        zoom={12}
      >
        <MarkerF position={location} />
      </GoogleMap>
    </div>
  );
}

export default GoogleMapLocator;