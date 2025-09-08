import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import CreateCourse from "./CreateCourse";
import AssignStudentCourse from "./AsignStudent";
import StudentCourseList from "./StudentCourseList";
import StudentScores from "./StudentScores";

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

  const handleResults = () => {
    navigate("/results");
  };

  return (
    <div className="admin_dashboard">
      <nav className="navbar">
        <h1 className="logo">Admin</h1>
        <ul className="nav-links">
          <li onClick={handleCourses}>Create courses</li>
          <li onClick={handleQuiz}>Create quizzes</li>
          <li onClick={handleStudent}>Assign student</li>
          <li>
            <select defaultValue="" onChange={(e) => {if (e.target.value === "manageCourseQuiz") handleCourseQuizManager();
                if (e.target.value === "studentList") handleStudentCourse();
              }}>
              <option value="" disabled>Manage</option>
              <option value="manageCourseQuiz">Manage course and quiz</option>
              <option value="studentList">Students List</option>
            </select>
          </li>
          <li>
            <select defaultValue="" onChange={(e) => {if (e.target.value === "studentScores") handleStudentScore();
                if (e.target.value === "answerSheets") handleResults();
              }}>
              <option value="" disabled>Results</option>
              <option value="studentScores">Student Scores</option>
              <option value="answerSheets">Answer sheets</option>
            </select>
          </li>

          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      <div className="admin_dashboard-content">
        <h2>Welcome, Admin!</h2>
        <p>Select an option from the menu to get started.</p>

        {createCourse && <CreateCourse />}
        {assignStudentCourse && <AssignStudentCourse />}
        {studentCourseList && <StudentCourseList />}
        {studentScores && <StudentScores />}
      </div>
    </div>
  );
}

export default Dashboard;
