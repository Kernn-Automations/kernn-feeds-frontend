import React from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";

function GoogleMapTracker() {
    const containerStyle = {
        width: "100%",
        height: "400px",
      };
      
      const center = {
        lat: 17.49172973655364, // Replace with your latitude
        lng:  78.38712249518254, // Replace with your longitude
      };
  return (
    <>
    
      <GoogleMap mapContainerStyle={containerStyle}  center={center} zoom={15}>
        <MarkerF position={center} />
      </GoogleMap>
    </>
  );
}

export default GoogleMapTracker;
