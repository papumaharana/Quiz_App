import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AssignStudentCourse() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load students and courses from backend
    const fetchData = async () => {
      try {
        const studentsRes = await axios.get("http://localhost:8000/students");
        const coursesRes = await axios.get("http://localhost:8000/courses");
        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        // console.error("Error loading data", err);
        setError("Error loading data: " + err.message);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedStudent || !selectedCourse) {
      // alert("Please select both student and course");
      setError("Please select both student and course");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/assign_course", {
        student_id: selectedStudent,
        course_id: selectedCourse,
      });
      // alert(res.data.message);
      setError(res.data.message)
    } catch (err) {
      setError(err.message + " : Already assigned")
      // alert("Error assigning student to course");
    }
  };

  return (

    <div className="asign_student_container">
      <div className="card">
      <h2>Assign Student to Course</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
     
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          class="dropdown"
        >
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.email}
            </option>
          ))}
        </select>
     

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          class="dropdown"
        >
          <option value="">-- Select Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
    
      <button onClick={handleAssign}>Assign</button>
      </div>
    </div>
  );
}
