import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/AdminLogin.css";

function AdminLogin({ onAdminLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("http://127.0.0.1:8000/admin/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error("Invalid email or password");

        const data = await response.json();

        // call parent handler
        onAdminLogin(data);

        navigate("/dashboard");
    } catch (err) {
        setError(err.message);
    }
  };

  return (
        <div className="card">
          <h2>Admin Login</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form className="form" onSubmit={handleSubmit}>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="User_name or email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
            <button type="submit">Login</button>
          </form>
        </div>
  );
}

export default AdminLogin;
