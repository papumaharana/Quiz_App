import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OtpVerification({ onStudentLogin }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/verify_otp/", {
        otp: otp,
      });

      const data = response.data;

      if (data.success) {
        // Call parent handler
        onStudentLogin(data.student);
        navigate("/studentdashboard");
      } else {
        setError(data.message || "OTP verification failed!");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }
  };

  return (
    <div className="card">
      <h2>Otp Verification</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify Otp</button>
      </form>
    </div>
  );
}

export default OtpVerification;
