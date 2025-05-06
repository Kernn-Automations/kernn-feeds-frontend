import React, { useState } from "react";
import styles from "./Products.module.css";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import { useAuth } from "@/Auth";
import { DialogActionTrigger } from "@/components/ui/dialog";

function TaxAddModal({ trigger, setTrigger }) {
  const [name, setName] = useState();
  const [percentage, setPercentage] = useState();
  const [description, setDescription] = useState();

  const [successfull, setSuccessfull] = useState(null);

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [errors, setErrors] = useState({});

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const validateFields = () => {
    const newErrors = {};
    if (!name) newErrors.name = true;
    if (!percentage) newErrors.percentage = true;
    if (!description) newErrors.description = true;

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

  const { axiosAPI } = useAuth();

  const onSubmitClick = () => {
    console.log(name, percentage, description);

    if (!validateFields()) {
      setError("Please Fill all feilds");
      setIsModalOpen(true);
      return;
    }
    async function create() {
      try {
        setLoading(true);
        const res = await axiosAPI.post("/tax", {
          name: name,
          percentage: percentage,
          description: description,
        });

        console.log(res);
        setTrigger(!trigger);
        setSuccessfull(res.data.message);
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
      <h3 className={`px-3 pb-3 mdl-title`}>Create Pricing</h3>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Date :</label>
          <input type="date" value={today} />
        </div>
      </div>{" "}
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Tax Name :</label>
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
          <label htmlFor="">Percentage :</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => onError(e, percentage, setPercentage)}
            className={errors.name ? styles.errorField : ""}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className={`col-4  inputcolumn-mdl`}>
          <label htmlFor="">Description :</label>
          <textarea
            name=""
            id=""
            value={description}
            onChange={(e) => onError(e, description, setDescription)}
            className={errors.name ? styles.errorField : ""}
          ></textarea>
        </div>
      </div>
      
      {!loading && !successfull && (
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
      {successfull && (
        <div className="row pt-3 mt-3 justify-content-center">
          <div className={`col-6`}>
            <DialogActionTrigger asChild>
              <button
                type="submit"
                className={`submitbtn`}
                data-bs-dismiss="modal"
              >
                {successfull}
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
      {/* {issuccessModalOpen && (
        <SuccessModal isOpen={issuccessModalOpen} message={error} onClose={closesuccessModal} />
      )} */}
    </>
  );
}

export default TaxAddModal;
