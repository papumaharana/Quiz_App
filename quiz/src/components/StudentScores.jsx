import axios from "axios";
import React, { useEffect, useState } from "react";

export default function StudentScores() {
  const [studentScore, setStudentScore] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get("http://localhost:8000/students");
        // Sort scores high → low
        const sortedScores = response.data.sort((a, b) => b.score - a.score);
        setStudentScore(sortedScores);
      } catch (err) {
        setError("Error fetching student scores:" + err.message);
      }
    };
    fetchScores();
  }, []);

  return (
    <div className="student_scores">
      <h2>Student Scores:</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {studentScore.map((score) => (
            <tr key={score.id}>
              <td>{score.name}</td>
              <td>{score.email}</td>
              <td>{score.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}