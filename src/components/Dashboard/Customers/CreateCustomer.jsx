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
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    aadhaarNumber: "",
    panNumber: "",
    firmName: "",
    gstin: "",
    msme: "",
    discountType: "bill_to_bill", // default backend expected value
    isTcsApplicable: false,
    salesExecutiveId: "",
    plot: "",
    street: "",
    area: "",
    city: "",
    mandal: "",
    district: "",
    state: "",
    pincode: "",
    location: { lat: 17.4065, lng: 78.4772 },
  });
  const isValidAadhaar = (value) => /^\d{12}$/.test(value);
  const isValidPAN = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase());
  const isValidGSTIN = (value) =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{2}$/.test(
    value.toUpperCase()
  );
  const [photo, setPhoto] = useState();
  const [aadhaarFront, setAadhaarFront] = useState();
  const [aadhaarBack, setAadhaarBack] = useState();
  const [panFront, setPanFront] = useState();
  const [panBack, setPanBack] = useState();

  const [businessOfficers, setBusinessOfficers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "aadhaarNumber") {
      // Remove non-digits and allow only 12 digits
      value = value.replace(/\D/g, "").slice(0, 12);
    }

    if (field === "panNumber") {
      value = value.toUpperCase().slice(0, 10); // Auto-uppercase, max 10 chars
    }

    if (field === "gstin") {
      value = value.toUpperCase().slice(0, 15);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const { axiosAPI } = useAuth();
  const token = localStorage.getItem("access_token");
  const VITE_API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBusinessOfficers = async () => {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/employees/role/Business Officer");
        setBusinessOfficers(res.data.employees);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching executives");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessOfficers();
  }, []);


  const handleCreate = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "location") {
        formData.append("latitude", value.lat);
        formData.append("longitude", value.lng);
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else {
        formData.append(key, value);
      }
    });

    formData.append("aadhaarFront", aadhaarFront?.file);
    formData.append("aadhaarBack", aadhaarBack?.file);
    formData.append("panFront", panFront?.file);
    formData.append("panBack", panBack?.file);
    formData.append("photo", photo?.file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${VITE_API}/customers/admin/add-customer`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(res.data.message);
      navigate("/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Customer creation failed");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/customers")}>Customers</span>{" "}
        <i className="bi bi-chevron-right"></i> Add Customer
      </p>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Customer Details</h5>
        {[
          { label: "Customer Name", field: "name" },
          { label: "Mobile Number", field: "mobile" },
          { label: "Whatsapp", field: "whatsapp" },
          { label: "Email", field: "email" },
          { label: "Firm Name", field: "firmName" },
          { label: "MSME Number", field: "msme" },
        ].map(({ label, field }) => (
          <div key={field} className={`col-3 ${styles.longform}`}>
            <label>{label} :</label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              required
            />
          </div>
        ))}
        {/* Aadhaar Number */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Aadhaar Number :</label>
          <input
            type="text"
            value={form.aadhaarNumber}
            onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
            required
          />
          {form.aadhaarNumber && !isValidAadhaar(form.aadhaarNumber) && (
            <small className="text-danger">Enter a valid 12-digit Aadhaar number</small>
          )}
        </div>

        {/* PAN Number */}
        <div className={`col-3 ${styles.longform}`}>
          <label>PAN Number :</label>
          <input
            type="text"
            value={form.panNumber}
            onChange={(e) => handleChange("panNumber", e.target.value)}
            required
          />
          {form.panNumber && !isValidPAN(form.panNumber) && (
            <small className="text-danger">Enter valid PAN (e.g. ABCDE1234F)</small>
          )}
        </div>

        {/* GSTIN */}  
        <div className={`col-3 ${styles.longform}`}>
          <label>GSTIN :</label>
          <input
            type="text"
            value={form.gstin}
            onChange={(e) => handleChange("gstin", e.target.value)}
            required
          />
          {form.gstin && !isValidGSTIN(form.gstin) && (
            <small className="text-danger">
              GSTIN must be 15 characters (e.g. 27ABCDE1234F1IJ)
            </small>
          )}
        </div>  
        <div className={`col-3 ${styles.longform}`}>
          <label>Discount Type :</label>
          <select
            value={form.discountType}
            onChange={(e) => handleChange("discountType", e.target.value)}
            required
          >
            <option value="bill_to_bill">Bill to Bill</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className={`col-3 ${styles.longform}`}>
          <label>TCS Applicable :</label>
          <input
            type="checkbox"
            checked={form.isTcsApplicable}
            onChange={(e) => handleChange("isTcsApplicable", e.target.checked)}
          />
        </div>

        <div className={`col-3 ${styles.longform}`}>
          <label>Sales Executive :</label>
          <select
            value={form.salesExecutiveId}
            onChange={(e) => handleChange("salesExecutiveId", e.target.value)}
            required
          >
            <option value="">--select--</option>
            {businessOfficers.map((se) => (
              <option key={se.id} value={se.id}>
                {se.name}
              </option>
            ))}
          </select>
        </div>

        <div className={`col-4 ${styles.location}`}>
          <label>Location :</label>
          <div className={styles.mapLink}>
            {showMap ? (
              <MapViewModal
                setLocation={(loc) => handleChange("location", loc)}
                defaultLocation={form.location}
                setDefaultLocation={(loc) => handleChange("location", loc)}
                onClose={() => setShowMap(false)}
              />
            ) : (
              <>
                <span>view map</span>
                <FaPen
                  className="ms-2 cursor-pointer"
                  onClick={() => setShowMap(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Address Fields */}
      <div className="row m-0 p-3">
        <h5 className={styles.headmdl}>Address</h5>
        {[
          "plot",
          "street",
          "area",
          "city",
          "mandal",
          "district",
          "state",
          "pincode",
        ].map((field) => (
          <div key={field} className={`col-3 ${styles.longform}`}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)} :</label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Image Uploads */}
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

      {/* Actions */}
      {!loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-3">
            <button className="submitbtn" onClick={handleCreate}>
              Create
            </button>
            <button
              className="cancelbtn"
              onClick={() => navigate("/customers")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <Loading />}
      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default CreateCustomer;
