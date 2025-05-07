import { DialogActionTrigger } from "@/components/ui/dialog";
import React, { useState } from "react";
import styles from "./Purchases.module.css";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import SuccessModal from "@/components/SuccessModal";

function AddVendorModal({changeTrigger}) {
  const [name, setName] = useState();
  const [plot, setPlot] = useState();
  const [street, setStreet] = useState();
  const [area, setArea] = useState();
  const [city, setCity] = useState();
  const [district, setDistrict] = useState();
  const [state, setState] = useState();
  const [supplierCode, setSupplierCode] = useState();
  const [pincode, setPincode] = useState();

  const { axiosAPI } = useAuth();
  // validation
  const [errors, setErrors] = useState({});

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };


  const [issuccessModalOpen, setIssuccessModalOpen] = useState(false);
  const closesuccessModal = () => {
    setIssuccessModalOpen(false);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!name) newErrors.name = true;
    if (!plot) newErrors.plot = true;
    if (!street) newErrors.street = true;
    if (!area) newErrors.area = true;
    if (!city) newErrors.city = true;
    if (!district) newErrors.district = true;
    if (!state) newErrors.state = true;
    if (!supplierCode) newErrors.supplierCode = true;
    if (!pincode) newErrors.pincode = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function onError(e, vari, setter) {
    const value = e.target.value === "null" ? null : e.target.value;
    setter(value);
    if (value) {
      setErrors((prev) => ({ ...prev, vari: false }));
    }
  }

  // form subbmission
  const onSubmitClick = () => {
    console.log(name, location);
    console.log(
      name,
      plot,
      street,
      area,
      city,
      district,
      state,
      supplierCode,
      pincode
    );

    if (!validateFields()) {
      setError("Please Fill all feilds");
      setIsModalOpen(true);
      return;
    }
    async function create() {
      try {
        setLoading(true);
        const res = await axiosAPI.post("/suppliers", {
          name: name,
          plot,
          street,
          area,
          city,
          district,
          state,
          supplierCode,
          pincode,
        });

        console.log(res);

        setError(res.data.message);
        setIssuccessModalOpen(true);
        changeTrigger();
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    create();
  };

  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Create Vendor</h3>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Vendor Code :</label>
          <input
            type="text"
            value={supplierCode}
            onChange={(e) => onError(e, supplierCode, setSupplierCode)}
            required
            className={errors.supplierCode ? styles.errorField : ""}
          />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Vendor Name :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onError(e, name, setName)}
            required
            className={errors.name ? styles.errorField : ""}
          />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Plot :</label>
          <input
            type="text"
            value={plot}
            onChange={(e) => onError(e, plot, setPlot)}
            required
            className={errors.plot ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Street :</label>
          <input
            type="text"
            value={street}
            onChange={(e) => onError(e, street, setStreet)}
            required
            className={errors.street ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Area :</label>
          <input
            type="text"
            value={area}
            onChange={(e) => onError(e, area, setArea)}
            required
            className={errors.area ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">City/Village :</label>
          <input
            type="text"
            value={city}
            onChange={(e) => onError(e, city, setCity)}
            required
            className={errors.city ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">District :</label>
          <input
            type="text"
            value={district}
            onChange={(e) => onError(e, district, setDistrict)}
            required
            className={errors.district ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">State :</label>
          <input
            type="text"
            value={state}
            onChange={(e) => onError(e, state, setState)}
            required
            className={errors.state ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Pincode :</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => onError(e, pincode, setPincode)}
            required
            className={errors.pincode ? styles.errorField : ""}
          />
        </div>
      </div>
      {!loading && (
        <div className="row pt-3 mt-3 justify-content-center">
          <div className={`col-5`}>
            <button
              type="submit"
              className={`submitbtn`}
              data-bs-dismiss="modal"
              onClick={onSubmitClick}
            >
              Create
            </button>
            <DialogActionTrigger asChild>
              <button
                type="button"
                className={`cancelbtn`}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </DialogActionTrigger>
          </div>
        </div>
      )}
      {loading && (
        <div className="row pt-3 mt-3 justify-content-center">
          <div className={`col-5`}>
            <Loading />
          </div>
        </div>
      )}
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
      {issuccessModalOpen && (
        <SuccessModal
          isOpen={issuccessModalOpen}
          message={error}
          onClose={closesuccessModal}
        />
      )}
    </>
  );
}

export default AddVendorModal;
