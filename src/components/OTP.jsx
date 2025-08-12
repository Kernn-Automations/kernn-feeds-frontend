import React, { useState, useContext } from "react";
import OtpInput from "react-otp-input";
import axios from "axios";
import Loading from "./Loading";
import ErrorModal from "./ErrorModal";
import styles from "./Login.module.css";
import { useAuth } from "../Auth";


function OTP({ email, resendOtp, setLogin, setUser }) {
  const { saveTokens } = useAuth();
  const [otp, setOtp]               = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const VITE_API = import.meta.env.VITE_API_URL;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${VITE_API}/auth/verify`, {
        mobile: email,
        otp,
      });

      if (res.status === 200) {
        console.log('OTP.jsx - OTP verified successfully, storing tokens...');
        console.log('OTP.jsx - Backend response data:', res.data);
        
        // Store both tokens using Auth context
        saveTokens(res.data.accessToken, res.data.refreshToken);

        // 2) persist the user object and flags for your Login.jsx
        const userPayload = {
          ...res.data.data,
          roles:         res.data.roles,
          showDivisions: res.data.showDivisions,
          userDivision:  res.data.userDivision,
        };
        console.log('OTP.jsx - Created userPayload:', userPayload);
        console.log('OTP.jsx - showDivisions flag:', userPayload.showDivisions);
        
        localStorage.setItem("user", JSON.stringify(userPayload));

        // 3) update your parent Login state
        setUser({
          accesstoken:   res.data.accessToken,
          refresh:       res.data.refreshToken,
          user:          userPayload,
        });
        setLogin(true);
      } else {
        throw new Error("Incorrect OTP");
      }
    } catch (e) {
      console.error("OTP verify failed:", e);
      setError(e.response?.data?.message || e.message || "OTP failed");
      setIsModalOpen(true);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
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
        <p className={styles.resend}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              resendOtp();
            }}
          >
            Resend Again
          </a>
        </p>

        {!loading && (
          <button className={styles.verifybutton}>Verify OTP</button>
        )}
        {loading && <Loading />}
      </form>

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

export default OTP;