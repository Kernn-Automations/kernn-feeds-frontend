import React, { useState, useEffect } from "react";
import LocationViewModal from "./LocationViewModal";
import styles from "./Location.module.css";
import { IoSearch } from "react-icons/io5";

import { useAuth } from "@/Auth";
import { GoogleMap, MarkerF, Polyline, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import LoadingAnimation from "@/components/LoadingAnimation";
import locationAni from "../../../images/animations/confirmed.gif";

function LocationsHome() {
  const [type, setType] = useState("employee");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [locations, setLocations] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null); // For InfoWindow popup
  const [loading, setLoading] = useState(false);
  const { axiosAPI } = useAuth();

  // Google Maps API key
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Fetch employees on mount
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await axiosAPI.get("/employees");
        setEmployees(res.data.employees || []);
      } catch (e) {
        // handle error
      }
    }
    fetchEmployees();
  }, []);

  // Fetch locations
  useEffect(() => {
    if (!selectedEmployee || !selectedDate) return;
    setLocations([]);

    // Fetch previous locations for selected employee and date
    setLoading(true);
    axiosAPI
      .get(`/location/history?employeeId=${selectedEmployee}&date=${selectedDate}`)
      .then(res => {
        setLocations(res.data.locations || []);
      })
      .catch(err => {
        console.error("Error fetching locations:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedEmployee, selectedDate]);

  // Center map on latest location or default
  const latest = locations.length > 0 ? locations[locations.length - 1] : null;
  const center = latest
    ? { lat: Number(latest.latitude), lng: Number(latest.longitude) }
    : { lat: 17.49172973655364, lng: 78.38712249518254 };

  let index = 1;
  return (
    <>
      <div className="row m-0 p-3 pt-5">
        <div className="col-3 formcontent">
          <label htmlFor="">Location Type :</label>
          <select name="" id="" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="employee">Employee</option>
            <option value="truck">Truck</option>
          </select>
        </div>
        {type === "employee" && (
          <>
            <div className="col-4 formcontent">
              <label htmlFor="employee-select">Select Employee: </label>
              <select
                id="employee-select"
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || emp.fullName || emp.employeeId || emp.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-3 formcontent">
              <label htmlFor="date-select">Select Date: </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

          </>
        )}
      </div>
      {/* <div className="row m-0 p-3 justify-content-end">
        <div className={`col-4 ${styles.search}`}>
          <input type="text" placeholder="Search..." />
          <span className={styles.searchicon}>
            <IoSearch />
          </span>
        </div>
      </div> */}
      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={locationAni} msg="Fetching location data..." />}

      {/* Map Section */}
      {type === "employee" && selectedEmployee && isLoaded && !loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-md-10">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "500px" }}
              center={center}
              zoom={15}
            >
              {/* Polyline for flow/route */}
              {locations.length > 1 && (
                <Polyline
                  path={locations.map(loc => ({
                    lat: Number(loc.latitude),
                    lng: Number(loc.longitude)
                  }))}
                  options={{
                    strokeColor: "#4285F4", // blue
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    zIndex: 2,
                  }}
                />
              )}
              {/* Stylish dot markers and InfoWindow with IST + battery */}
              {(() => {
                // Find the latest location by comparing timestamps
                let latestLocation = null;
                let latestTime = 0;
                
                locations.forEach(loc => {
                  const rawTime = loc.recordedAt || loc.timestamp || loc.time || loc.createdAt;
                  if (rawTime) {
                    const time = new Date(rawTime).getTime();
                    if (time > latestTime) {
                      latestTime = time;
                      latestLocation = loc;
                    }
                  }
                });

                console.log('Latest location found:', latestLocation);
                console.log('Latest time:', latestTime);

                return locations.map((loc, idx) => {
                  // --- Format date/time to IST ---
                  let dateObj = null;
                  let timeLabel = "";
                  if (loc.recordedAt || loc.timestamp || loc.time || loc.createdAt) {
                    const rawTime = loc.recordedAt || loc.timestamp || loc.time || loc.createdAt;
                    dateObj = new Date(rawTime);
                    if (!isNaN(dateObj)) {
                      // DD/MM/YYYY, HH:mm:ss
                      const pad = n => n.toString().padStart(2, '0');
                      const day = pad(dateObj.getDate());
                      const month = pad(dateObj.getMonth() + 1);
                      const year = dateObj.getFullYear();
                      const hours = pad(dateObj.getHours());
                      const mins = pad(dateObj.getMinutes());
                      const secs = pad(dateObj.getSeconds());
                      timeLabel = `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
                    } else {
                      timeLabel = rawTime;
                    }
                  }
                  
                  // --- Get battery percent (all possible keys) ---
                  const battery =
                    loc.batteryLevel ??
                    loc.batteryPercent ??
                    loc.battery_percentage ??
                    loc.battery ??
                    null;

                  // Check if this is the latest location
                  const isLatest = latestLocation && 
                    (loc.id === latestLocation.id || 
                     (loc.recordedAt === latestLocation.recordedAt && 
                      loc.latitude === latestLocation.latitude && 
                      loc.longitude === latestLocation.longitude));
                  
                  console.log(`Location ${idx} - isLatest: ${isLatest}, id: ${loc.id}, time: ${loc.recordedAt}`);

                  return (
                    <MarkerF
                      key={idx}
                      position={{
                        lat: Number(loc.latitude),
                        lng: Number(loc.longitude)
                      }}
                      icon={{
                        url: isLatest 
                          ? "data:image/svg+xml;utf-8,<svg height='28' width='28' xmlns='http://www.w3.org/2000/svg'><circle cx='14' cy='14' r='10' fill='%23FF0000' stroke='white' stroke-width='3'/><circle cx='14' cy='14' r='4' fill='white'/></svg>"
                          : "data:image/svg+xml;utf-8,<svg height='24' width='24' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='8' fill='%2366BB6A' stroke='white' stroke-width='2'/></svg>",
                        scaledSize: isLatest ? { width: 28, height: 28 } : { width: 24, height: 24 }
                      }}
                      title={`${isLatest ? 'LATEST - ' : ''}Date & Time (IST): ${timeLabel}${battery !== null ? `, Battery: ${battery}%` : ''}`}
                      onClick={() => setActiveMarker(idx)}
                    >
                      {activeMarker === idx && (
                        <InfoWindow
                          position={{
                            lat: Number(loc.latitude),
                            lng: Number(loc.longitude)
                          }}
                          onCloseClick={() => setActiveMarker(null)}
                        >
                          <div>
                            {isLatest && <div style={{ color: '#FF4444', fontWeight: 'bold', marginBottom: '5px' }}>📍 LATEST LOCATION</div>}
                            <div><b>Date & Time (IST):</b> {timeLabel}</div>
                            {battery !== null && (
                              <div><b>Battery:</b> {battery}%</div>
                            )}
                          </div>
                        </InfoWindow>
                      )}
                    </MarkerF>
                  );
                });
              })()}
            </GoogleMap>
          </div>
        </div>
      )}
      {/* Table fallback for truck or if you want to keep it */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-md-10">
          {type === "truck" && (
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Truck Number</th>
                  <th>GPS Tracker ID</th>
                  <th>Warehouse ID</th>
                  <th>Warehouse Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="animated-row" style={{ animationDelay: `${index++ * 0.1}s` }}>
                  <td>1</td>
                  <td>TS02AB2332</td>
                  <td>tracker 1</td>
                  <td>#4545</td>
                  <td>Warehouse 1</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
                <tr className="animated-row" style={{ animationDelay: `${index++ * 0.1}s` }}>
                  <td>2</td>
                  <td>TS03TR0032</td>
                  <td>Tracker 2</td>
                  <td>#4546</td>
                  <td>Warehouse 2</td>
                  <td>
                    <LocationViewModal />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default LocationsHome;