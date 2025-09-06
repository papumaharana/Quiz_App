import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StudentDashboard({ onStudentLogout, student: studentProp }) {
  const navigate = useNavigate();

  const [student, setStudent] = useState(() => {
    // Restore from localStorage if available
    const savedStudent = localStorage.getItem("student");
    return savedStudent ? JSON.parse(savedStudent) : studentProp || null;
  });

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  // Save new student prop (from login) to localStorage
  useEffect(() => {
    if (studentProp) {
      localStorage.setItem("student", JSON.stringify(studentProp));
      setStudent(studentProp);
    }
  }, [studentProp]);

  // Fetch student courses
  useEffect(() => {
    if (!student || !student.id) return; // prevent /undefined call

    const fetchData = async () => {
      try {
        const coursesRes = await axios.get(
          `http://localhost:8000/student_courses/${student.id}`
        );
        setCourses(coursesRes.data);
      } catch (err) {
        setError("Error loading data: " + err.message);
      }
    };

    fetchData();
  }, [student]);

  const handleLogout = () => {
    onStudentLogout();
    localStorage.removeItem("student");
    navigate("/"); // Redirect to login
  };

  // Redirect to login if no student found
  useEffect(() => {
    if (!student) {
      navigate("/"); 
    }
  }, [student, navigate]);

  if (!student) {
    return <h2>Loading... Redirecting to login...</h2>;
  }

  return (
    <>{console.log("hii",localStorage.getItem("student"))}
      <h2>Hii {student.name}!</h2>
      <nav className="navbar">
        <h1 className="logo">Student Dashboard</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <ul className="nav-links">
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      <div>
        <h3>Your Courses:</h3>
        <table>
          <thead>
            <tr>
              <th>Course title</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default StudentDashboard;
