import { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";

import OTP from "./OTP";
import Loading from "./Loading";
import ErrorModal from "./ErrorModal";

function Input({ setLogin, setUser }) {
  const [ontap, setOntap] = useState(false);
  const [email, setEmail] = useState();
  const [res, setRes] = useState();
  const [resp, setResp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();
    setOntap(true);
    setResp(true);

    console.log("use called");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://kernn.azurewebsites.net/api/v1/login",
        {
          mobile: email,
        }
      );
      console.log(res)
      setRes(response.data);
      console.log(res)
      if (response.status === 200) {
        setLoading(false);
        setResp(true);
      } else {
        // <ErrorModal ErrorMessage={res}/>
        setResp(false);
        setOntap(false);
      }
    } catch (e) {
      console.log(e);
      setOntap(false);
      e.response.data.message ? setError(e.response.data.message) : setError(e.response.data)
      setIsModalOpen(true)
      
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="row justify-content-center mb-2">
      <div className={`col-6 ${styles.inputContainer}`}>
        <form action="" onSubmit={onSubmit}>
          <p className={styles.p}>Login to continue</p>
          <label className={styles.label}>mobile number</label>
          <input
            type="text"
            onChange={onChange}
            className={styles.input}
            required
          />

          {!ontap && <button data-bs-toggle="modal" data-bs-target="#exampleModal" className={styles.button}>Send OTP</button>}
        </form>
        {loading && <Loading />}
        {ontap && !loading && resp && (
          <OTP
            email={email}
            resendOtp={onSubmit}
            setLogin={setLogin}
            setUser={setUser}
          />
        )}
       
      </div>
     {isModalOpen &&  <ErrorModal
        isOpen={isModalOpen}
        message={error}
        onClose={closeModal}
      />}
      </div>
    </>
  );
}

export default Input;
