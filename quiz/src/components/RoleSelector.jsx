import React, { useState } from "react";
import AdminLogin from "./AdminLogin";
import Studentlogin from "./StudentLogin";

function RoleSelector({ onAdminLogin }) {
  const [role, setRole] = useState("");

  return (
    <div className="role_container">
  {role === "" && (
    <div className="card">
      <h1>Select Role</h1>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="dropdown"
      >
        <option value="">-- Select --</option>
        <option value="admin">Admin</option>
        <option value="student">Student</option>
      </select>
    </div>
  )}

  {role === "student" && <Studentlogin />}
  {role === "admin" && <AdminLogin onAdminLogin={onAdminLogin} />}
</div>

  );
}

export default RoleSelector;