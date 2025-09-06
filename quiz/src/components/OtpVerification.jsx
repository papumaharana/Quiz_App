import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function OtpVerification({ onStudentLogin }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/verify_otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include"
      });

      const data = await response.json();

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
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
