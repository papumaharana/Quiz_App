import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import ViewCourses from "./ViewCourses";
import ViewQuizzes from "./ViewQuizzes";
import ViewStudents from "./ViewStudents";

function Dashboard({ onAdminLogout }) {
  const navigate = useNavigate();
  const [view, setView] = useState("")

  const handleLogout = () => {
    onAdminLogout();
    navigate("/");
  };



  const handleCourses = () => {
    navigate("/create_courses");
  };
  const handleStudent = () => {
    navigate("/asign_student");
  };
  
  const handleStudentCourse = () => {
    navigate("/student_course_list");
  };



  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1 className="logo">Admin Dashboard</h1>
        <ul className="nav-links">
          <li onClick={handleCourses}>Create courses</li>
          <li onClick={handleStudent}>Assign student with courses</li>
          <li onClick={handleStudentCourse}>Students Course List</li>
          <li>Create quizzes</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <h2>Welcome, Admin!</h2>
        <p>This is your dashboard route.</p>
      </div>

      <div >
        
          <div>
            <h3>Show :</h3>
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="">-- Select --</option>
              <option value="student">Student</option>
              <option value="courses">Courses</option>
              <option value="quiz">Quizzes</option>
            </select>
          </div><br/>
        

        {view === "student" && <ViewStudents />}
        {view === "courses" && <ViewCourses />}
        {view === "quiz" && <ViewQuizzes />}
      </div>

    </div>
  );
}

export default Dashboard;
