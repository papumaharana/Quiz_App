// import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard({onStudentLogout}){
    const navigate = useNavigate()

    const handleLogout = () => {
    onStudentLogout();
    navigate("/");
  };

    return <>
        <h2>Hii student!</h2>
        <button onClick={handleLogout}>Exit</button>
    </>
}

export default StudentDashboard;