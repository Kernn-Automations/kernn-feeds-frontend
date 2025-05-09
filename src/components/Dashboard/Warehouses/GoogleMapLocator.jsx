import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Box, Typography, Button } from "@mui/material";
import SearchBox from "./SearchBox";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
} from "@/components/ui/dialog";

import styles from "./Warehouse.module.css";
import { DialogTrigger } from "@chakra-ui/react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapLocator = ({
  setLocation,
  defaultLocation,
  setDefaultLocation,
}) => {
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDefaultLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError("Unable to retrieve your location: " + err.message);
      }
    );
  }, []);

  const [selectedPosition, setSelectedPosition] = useState(defaultLocation);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  const mapRef = useRef(null);

  console.log("locccc----", selectedPosition);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = async (event) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedPosition({ lat, lng });
      console.log(event, lat, lng);

      try {
        const results = await getGeocode({ location: { lat, lng } });
        setSelectedAddress(results[0].formatted_address);
      } catch (error) {
        console.error("Error fetching address:", error);
      }

      setConfirmVisible(true);
    }
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      setConfirmVisible(false);
    }
  };

  const handleCancel = () => {
    setSelectedPosition(null);
    setSelectedAddress("");
    setConfirmVisible(false);
  };

  const handleSelectFromSearch = async (address) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setSelectedPosition({ lat, lng });
      setSelectedAddress(results[0].formatted_address);
      setConfirmVisible(true);
    } catch (error) {
      console.error("Error fetching geocode:", error);
    }
  };
  console.log(selectedPosition, selectedAddress);
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        <SearchBox onSelectFromSearch={handleSelectFromSearch} />
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedPosition}
        zoom={12}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        <MarkerF position={selectedPosition} />
      </GoogleMap>

      <div className="row m-0 pt-3 pb-1 justify-content-center">
        <div className="col-2">
          <DialogRoot placement={"center"} className={styles.mdl}>
            <DialogTrigger asChild>
              <button className="submitbtn">Confirm</button>
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h4>Confirm Location</h4>
                <div className="row m-0 p-3 justify-content-center">
                  <div className="col-12">
                    <p className={styles.lant}>
                      <span>Latitude : </span>
                      {selectedPosition.lat}
                    </p>
                    <p className={styles.lant}>
                      <span>Longitude : </span>
                      {selectedPosition.lng}
                    </p>
                    <p className={styles.lant}>
                      <span>Address : </span>
                      {selectedAddress}
                    </p>
                  </div>
                </div>
                <div className="row m-0 p-3 justify-content-center">
                  <div className="col-7">
                    <DialogActionTrigger asChild>
                      <button
                        className="submitbtn"
                        onClick={setLocation(selectedPosition)}
                      >
                        Confirm
                      </button>
                    </DialogActionTrigger>
                    <DialogActionTrigger>
                      <button className="cancelbtn">Cancel</button>
                    </DialogActionTrigger>
                  </div>
                </div>

                <DialogCloseTrigger className="inputcolumn-mdl-close" />
              </DialogBody>
            </DialogContent>
          </DialogRoot>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapLocator;
