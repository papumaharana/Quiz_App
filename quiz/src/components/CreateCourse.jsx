import React, { useState } from "react";
import axios from "axios";

function CreateCourse() {
  const [course, setCourse] = useState("");
//   const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/create_course", {
        course,
      });
    //   setMessage(res.data.message || "Course created successfully!");
      setError(res.data.message)
      setCourse(""); // clear input
    } catch (err) {
      setError("Error creating course: " + err.message);
    }
  };

  return (
    <div className="create_course_container">
      <div className="card">
        <h2>Add Courses</h2>
        {/* {message && <p style={{ color: "green" }}>{message}</p>} */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            placeholder="Course name"
          />
          <button type="submit">+ Add</button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;
