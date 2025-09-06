import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import RoleSelector from "./components/RoleSelector";
import StudentDashboard from "./components/StudentDashboard";
import OtpVerification from "./components/OtpVerification";
import AssignStudentCourse from "./components/AsignStudent";
import StudentCourseList from "./components/StudentCourseList";
import CreateCourse from "./components/CreateCourse";
import CreateQuiz from "./components/CreateQuiz";
import CourseQuizManager from "./components/CourseQuizManager";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'


export default function App() {
  // use state to track login session
  const [admin, setAdmin] = useState(() => sessionStorage.getItem("admin"));
  const [student, setStudent] = useState(() => sessionStorage.getItem("student"));

  // helper to update state when login/logout occurs
  const handleAdminLogin = (adminData) => {
    sessionStorage.setItem("admin", JSON.stringify(adminData)); // Admin stored in session
    setAdmin(adminData);
  };
  const handleStudentLogin = (studentData) => {
    sessionStorage.setItem("student", JSON.stringify(studentData)); // Student stored in session
    setStudent(studentData);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("admin"); //Admin log out
    setAdmin(null);
  };
  const handleStudentLogout = () => {
    sessionStorage.removeItem("student"); //Student log out
    setStudent(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={ admin ? (<Navigate to="/dashboard" />) 
                                : student ? (<Navigate to="/studentdashboard" />) 
                                : (<RoleSelector onAdminLogin={handleAdminLogin} />)}/>
        {/* <Route path="/admin-login" element={admin ? <Navigate to="/dashboard" /> : <AdminLogin onAdminLogin={handleAdminLogin} />} /> */}
        <Route path="/dashboard" element={admin ? <Dashboard onAdminLogout={handleAdminLogout} /> : <Navigate to="/" />} />
        <Route path="/verify_otp" element={<OtpVerification onStudentLogin={handleStudentLogin}/>} />
        <Route path="/studentdashboard" element={student ? <StudentDashboard onStudentLogout={handleStudentLogout} /> : <Navigate to="/" />} />

        <Route path="/asign_student" element={admin ? <AssignStudentCourse /> : <Navigate to="/" />} />
        <Route path="/view_students" element={admin ? <AssignStudentCourse /> : <Navigate to="/" />} />
        <Route path="/view_courses" element={admin ? <AssignStudentCourse /> : <Navigate to="/" />} />
        <Route path="/view_quizzes" element={admin ? <AssignStudentCourse /> : <Navigate to="/" />} />


        <Route path="/create_courses" element={admin ? <CreateCourse /> : <Navigate to="/" />} />
        <Route path="/create_quiz" element={admin ? <CreateQuiz /> : <Navigate to="/" />} />
        <Route path="/student_course_list" element={admin ? <StudentCourseList /> : <Navigate to="/" />} />
        <Route path="/course_quiz_manager" element={admin ? <CourseQuizManager /> : <Navigate to="/" />} />


      </Routes>
    </Router>
  );
}




