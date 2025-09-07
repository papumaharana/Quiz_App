import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import CreateCourse from "./CreateCourse";
import AssignStudentCourse from "./AsignStudent";
import StudentCourseList from "./StudentCourseList";
import StudentScores from "./StudentScores";
import "./css/Dashboard.css";

function Dashboard({ onAdminLogout }) {
  const navigate = useNavigate();
  const [createCourse, setCreateCourse] = useState(true);
  const [assignStudentCourse, setAssignStudentCourse] = useState(false);
  const [studentCourseList, setStudentCourseList] = useState(false);
  const [studentScores, setStudentScores] = useState(false);


  const handleLogout = () => {
    onAdminLogout();
    navigate("/");
  };



  const handleCourses = () => {
    setCreateCourse(true);
    setAssignStudentCourse(false);
    setStudentCourseList(false);
    setStudentScores(false);
  };
  const handleStudent = () => {
    setCreateCourse(false);
    setAssignStudentCourse(true);
    setStudentCourseList(false);
    setStudentScores(false);
  };
  const handleStudentCourse = () => {
    setCreateCourse(false);
    setAssignStudentCourse(false);
    setStudentCourseList(true);
    setStudentScores(false);
  };
  const handleStudentScore = () => {
    setCreateCourse(false);
    setAssignStudentCourse(false);
    setStudentCourseList(false);
    setStudentScores(true);
  };
  const handleQuiz = () => {
    navigate("/create_quiz");
  };
  const handleCourseQuizManager = () => {
    navigate("/course_quiz_manager");
  };



  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1 className="logo">Admin</h1>
        <ul className="nav-links">
          <li onClick={handleCourses}>Create courses</li>
          <li onClick={handleStudent}>Assign student with courses</li>
          <li onClick={handleStudentCourse}>Students Course List</li>
          <li onClick={handleQuiz}>Create quizzes</li>
          <li onClick={handleCourseQuizManager}>Manage course and quiz</li>
          <li onClick={handleStudentScore}>Student Scores</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
      <div className="dashboard-content">
        <h2>Welcome, Admin!</h2>
        <p>Select an option from the menu to get started.</p>
      </div>



      <div className="container">
        {createCourse && <CreateCourse />}
        {assignStudentCourse && <AssignStudentCourse />} 
        {studentCourseList && <StudentCourseList />} 
        {studentScores && <StudentScores />} 
      </div>

    </div>
  );
}

export default Dashboard;
