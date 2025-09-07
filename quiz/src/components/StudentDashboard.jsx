import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function StudentDashboard({ onStudentLogout, student: studentProp }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState("");

  const [student, setStudent] = useState(() => {
    const savedStudent = localStorage.getItem("student");
    return savedStudent ? JSON.parse(savedStudent) : studentProp || null;
  });

  useEffect(() => {
    if (studentProp) {
      localStorage.setItem("student", JSON.stringify(studentProp));
      setStudent(studentProp);
    }
  }, [studentProp]);

  useEffect(() => {
    if (!student || !student.id) return;

    const fetchData = async () => {
      try {
        const coursesRes = await axios.get(
          `http://localhost:8000/student_courses/${student.id}`
        );

        if (Array.isArray(coursesRes.data)) {
          setCourses(coursesRes.data);

          const attemptStatus = {};
          const scoreStatus = {}

          for (let course of coursesRes.data) {
            const attemptRes = await axios.get(
              `http://localhost:8000/check_attempt/${student.id}/${course.id}`
            );
            attemptStatus[course.id] = attemptRes.data.attempted;

            const scoreRes = await axios.get(
              `http://localhost:8000/student_score/${student.id}/${course.id}`
            );
            scoreStatus[course.id] = scoreRes.data.score;
          }

          setAttempts(attemptStatus);
          setScores(scoreStatus);

          // TotalScore calculation:
          const scoreRes = await axios.get(
          `http://localhost:8000/total_score/${student.id}`
        );
        setTotalScore(scoreRes.data.total_score || 0);

        } else {
          setError(coursesRes.data.message || "No courses found");
        }
      } catch (err) {
        setError("Error loading data: " + err.message);
      }
    };

    fetchData();
  }, [student]);

  const handleLogout = () => {
    onStudentLogout();
    localStorage.removeItem("student");
    navigate("/");
  };

  useEffect(() => {
    if (!student) {
      navigate("/");
    }
  }, [student, navigate]);

  if (!student) {
    return <h2>Loading... Redirecting to login...</h2>;
  }

  return (
    <>
      <nav className="navbar">
      <div className="logo">Student Dashboard</div>
        <ul className="nav-links">
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
      <div className="student_name">
        <h2>:--------- Welcome {student.name} ---------:</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      
      <div className="student_dashboard-content">
        <h3>Your Courses:</h3>
        <table>
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Quiz</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>
                  {scores[course.id] !== null && scores[course.id] !== undefined
                    ? `${scores[course.id]}%`
                    : "-"}
                </td>
                <td>
                  <button
                    onClick={() => navigate(`/attend_quiz/${course.id}`)}
                    disabled={attempts[course.id]}
                    style={{
                      backgroundColor: attempts[course.id] ? "gray" : "blue",
                      color: "white",
                      cursor: attempts[course.id] ? "not-allowed" : "pointer",
                    }}
                  >
                    {attempts[course.id] ? "Attempted" : "Attend Quiz"}
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
        {totalScore > 0 && (
          <h3 style={{ marginTop: '20px' }}>Total Score : {totalScore}%</h3>
        )}
      </div>
    </>
  );
}

export default StudentDashboard;
