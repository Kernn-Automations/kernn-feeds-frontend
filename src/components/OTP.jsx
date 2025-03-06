import styles from "./Login.module.css";
import React, { useState } from "react";
import OtpInput from "react-otp-input";
import axios from "axios";
import Loading from "./Loading";
import ErrorModal from "./ErrorModal";

function OTP({ email, resendOtp, setLogin, setUser }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("onSubmit called");

    try {
      const res = await axios.post(
        "https://kernn.azurewebsites.net/api/v1/verify_otp",
        {
          mobile: email,
          otp: otp,
        }
      );

      console.log(res);

      setLogin(true);

      if (res.status === 200) {
        setUser({
          accesstoken: res.data.accesstoken,
          refresh: res.data.refresh_token,
          user: res.data.data,
        });
        setLogin(true);
      } else {
        alert("Incorrect OTP", 1);
        setOtp(0);
      }
    } catch (e) {
      setOtp(0);
      setError(e.response.data.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <form action="" onSubmit={onSubmit}>
        <label className={styles.otplabel}>OTP</label>
        <div className={styles.otps}>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span></span>}
            renderInput={(props) => (
              <input className={styles.otps} {...props} required />
            )}
          />
        </div>
        <p className={styles.resend} onClick={resendOtp}>
          <a href="" className="nav-link">
            Resend Again
          </a>
        </p>

        {!loading && <button className={styles.button}>Verify OTP</button>}
        {loading && <Loading />}
      </form>

      {isModalOpen &&  <ErrorModal
        isOpen={isModalOpen}
        message={error}
        onClose={closeModal}
      />}
    </>
  );
}

export default OTP;
