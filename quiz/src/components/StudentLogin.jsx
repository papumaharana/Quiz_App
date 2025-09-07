import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


function Studentlogin( ){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("Sending OTP...");
        try {
            const response = await fetch("http://127.0.0.1:8000/sent_otp/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            if (!response.ok) throw new Error("ABCD");

            const data = await response.json();

            // call parent handler
            // onStudentLogin(data);
            setError(data.message)
            navigate("/verify_otp");

        } catch (err) {
            setError(err.message);
        }
  };
    return <>
        <div className="student_login_card">
          <h2>Student Form</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form className="form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
            <button type="submit">Get Otp</button>
          </form>
        </div>
    </>
}

export default Studentlogin