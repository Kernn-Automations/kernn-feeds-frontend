import React, { useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  StandaloneSearchBox,
} from "@react-google-maps/api";

function GoogleMapLocator() {
  const containerStyle = {
    width: "100%",
    height: "500px",
  };

  const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Default location

  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [location, setLocation] = useState(defaultCenter);

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const searchBoxRef = useRef(null);

  // Handle when the user selects a location from the search box
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      setMarkerPosition({
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  // Initialize the search box reference
  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  // const onAutoCompleteLoad = (autocompleteInstance) => {
  //   setAutocomplete(autocompleteInstance);
  // };

  // const onPlaceChanged = () => {
  //   console.log("on place change caled");
  //   if (autocomplete !== null) {
  //     const place = autocomplete.getPlace();
  //     if (place.geometry) {
  //       const newLocation = {
  //         lat: place.geometry.location.lat(),
  //         lng: place.geometry.location.lng(),
  //       };
  //       setLocation(newLocation);
  //       map.panTo(newLocation);
  //     }
  //   }
  // };

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
