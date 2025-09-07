import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentCourseList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/students-with-courses/");
      setData(res.data);
    } catch (err) {
      // console.error("Error fetching students with courses", err);
      setError("Error fetching students with courses : ", err)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemove = async (studentId, courseId) => {
    try {
      await axios.delete("http://localhost:8000/unassign-course/", {
        params: { student_id: studentId, course_id: courseId },
      });
      // alert("Course removed from student");
      setError("Course removed from student")
      fetchData(); // refresh data after removal
    } catch (err) {
      // console.error(err);
      // alert("Error removing course");
      setError("Error removing course : ", err)
    }
  };

  return (
    <div className="student_course_list">
      <h2>Students and Assigned Courses</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Assigned Courses</th>
          </tr>
        </thead>
        <tbody>
          {data.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>
                {student.courses.length > 0 ? (
                  student.courses.map((course) => (
                    <span key={course.id} style={{ marginRight: "10px" }}>
                      {course.title}{" "}
                      <button
                        onClick={() => handleRemove(student.id, course.id)}
                        style={{ marginLeft: "5px", color: "red" }}
                      >
                        Remove
                      </button>
                    </span>
                  ))
                ) : (
                  <i>No courses assigned</i>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
