import React, { useEffect, useState } from "react";
import styles from "./Customer.module.css";
import { useAuth } from "@/Auth";
import { FaMapMarkerAlt, FaPen } from "react-icons/fa";
import ImageUploadBox from "./ImageUploadBox";
import MapViewModal from "./MapViewModal";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import axios from "axios";

function CreateCustomer({ navigate }) {
  const today = new Date(Date.now()).toISOString().slice(0, 10);
  const nowIST = new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successful, setSuccessful] = useState();
  const closeModal = () => setIsModalOpen(false);

  const [name, setName] = useState();
  const [mobile, setMobile] = useState();
  const [whatsapp, setWhatsapp] = useState();
  const [email, setEmail] = useState();
  const [address, setAddress] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [aadharNumber, setAadharNumber] = useState();
  const [panNumber, setPanNumber] = useState();
  const [firmName, setFirmName] = useState();
  const [photo, setPhoto] = useState();
  const [aadhaarFront, setAadhaarFront] = useState();
  const [aadhaarBack, setAadhaarBack] = useState();
  const [panFront, setPanFront] = useState();
  const [panBack, setPanBack] = useState();
  const [gstin, setGstin] = useState();
  const [msme, setMsme] = useState();
  const [seId, setSeId] = useState();

  const [showMap, setShowMap] = useState(false);

  const [editclick, setEditclick] = useState();

  const [defaultLocation, setDefaultLocation] = useState({
    lat: 17.4065,
    lng: 78.4772,
  });
  const [location, setLocation] = useState(defaultLocation);

  //   function onError(e, vari, setter) {
  //     const value = e.target.value === "null" ? null : e.target.value;
  //     setter(value);
  //     if (value) {
  //       setErrors((prev) => ({ ...prev, vari: false }));
  //     }
  //   }

  const user = JSON.parse(localStorage.getItem("user"));

  const { axiosAPI } = useAuth();

  const [ses, setSes] = useState();
  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/employees/role/Business Officer");
        // console.log(res);
        setSes(res.data.employees);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const VITE_API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token");

  console.log("data : ", name,mobile, whatsapp, email, seId, aadharNumber, panNumber)

  const onCreate = async () => {
    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("mobile", mobile);
    formdata.append("whatsapp", whatsapp);
    formdata.append("email", email);
    formdata.append("aadhaarNumber", aadharNumber);
    formdata.append("panNumber", panNumber);
    formdata.append("gstin", gstin);
    formdata.append("msme", msme);
    formdata.append("salesExecutiveId", seId);
    formdata.append("firmName", firmName);
    formdata.append("address", address);
    formdata.append("latitude", location.lat);
    formdata.append("longitude", location.lng);
    formdata.append("aadhaarFront", aadhaarFront.file);
    formdata.append("aadhaarBack", aadhaarBack.file);
    formdata.append("panFront", panFront.file);
    formdata.append("panBack", panBack.file);
    formdata.append("photo", photo.file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${VITE_API}/customers/admin/add-customer`,
        formdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res);
      setSuccessful(res.data.message);
    } catch (e) {
      console.log(e);
      setError(e.response.data.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i class="bi bi-chevron-right"></i> Add Customer
      </p>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Customer Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Customer Name :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Mobile Number :</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Whatsapp :</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Email :</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Aadhaar Number :</label>
          <input
            type="text"
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            required
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">PAN Number :</label>
          <input
            type="text"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value)}
            required
          />
        </div>
        {/* <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Whatsapp :</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
          />
        </div> */}
        <div className={`col-3 ${styles.longform}`}>
          <label>GSTIN :</label>
          <input
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />
        </div>

        <div className={`col-3 ${styles.longform}`}>
          <label>MSME Number :</label>
          <input
            type="text"
            value={msme}
            onChange={(e) => setMsme(e.target.value)}
          />
        </div>

        <div className={`col-3 ${styles.longform}`}>
          <label>Firm Name :</label>
          <input
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Sales Executive :</label>
          <select
            name=""
            id=""
            value={seId}
            onChange={(e) => setSeId(e.target.value)}
            required
          >
            <option value="null">--select--</option>
            {ses && ses.map((se) => <option value={se.id}>{se.name}</option>)}
          </select>
        </div>
        <div className={`col-4 ${styles.location}`}>
          <label htmlFor="">Location :</label>
          <a
            // href={googleMapsURL}
            target="_blank"
            rel="noreferrer"
            className={styles.mapLink}
          >
            {/* <FaMapMarkerAlt /> View on Map */}
            {showMap ? (
              <MapViewModal
                setLocation={setLocation}
                defaultLocation={defaultLocation}
                setDefaultLocation={setDefaultLocation}
                onClose={() => setShowMap(false)} // Optional close handler
              />
            ) : location?.lat ? (
              <>
                <span>view map</span>
                <FaPen
                  className="ms-2 cursor-pointer"
                  onClick={() => setShowMap(true)}
                />
              </>
            ) : null}
          </a>
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Address</h5>
        <div className={`col-10 ${styles.textform}`}>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Customer Photo</h5>
        <div className={`col-3 ${styles.longform}`}>
          <ImageUploadBox
            file={photo}
            setFile={setPhoto}
            label={"Customer Photo"}
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>Aadhar Proof</h5>
        <div className={`col-3 ${styles.longform}`}>
          <ImageUploadBox
            file={aadhaarFront}
            setFile={setAadhaarFront}
            label={"Aadhar Front"}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <ImageUploadBox
            file={aadhaarBack}
            setFile={setAadhaarBack}
            label={"Aadhar Back"}
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>PAN Proof</h5>
        <div className={`col-3 ${styles.longform}`}>
          <ImageUploadBox
            file={panFront}
            setFile={setPanFront}
            label={"PAN Front"}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <ImageUploadBox
            file={panBack}
            setFile={setPanBack}
            label={"PAN Back"}
          />
        </div>
      </div>

      {!loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-3">
            <button className="submitbtn" onClick={onCreate}>
              Create
            </button>
            <button
              className="cancelbtn"
              onClick={() => navigate("/customers")}
            >
              cancel
            </button>
          </div>
        </div>
      )}
      {/* {successful && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-5">
            <button
              className="submitbtn"
              onClick={() => navigate("/customers")}
            >
              {successful}
            </button>
          </div>
        </div>
      )} */}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {loading && <Loading />}
    </>
  );
}

export default CreateCustomer;
