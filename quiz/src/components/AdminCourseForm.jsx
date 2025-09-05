import React, { useState } from "react";
import axios from "axios";

export default function AdminCourseForm() {
  const [courseTitle, setCourseTitle] = useState("");
  const [quizzes, setQuizzes] = useState([
    { title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" },
  ]);

  const handleQuizChange = (index, field, value) => {
    const newQuizzes = [...quizzes];
    newQuizzes[index][field] = value;
    setQuizzes(newQuizzes);
  };

  const addQuiz = () => {
    setQuizzes([...quizzes, { title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: courseTitle,
      quizzes: quizzes,
    };

    try {
      const res = await axios.post("http://localhost:8000/courses/", payload);
      alert(res.data.message);
      setCourseTitle("");
      setQuizzes([{ title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" }]);
    } catch (err) {
      console.error(err);
      alert("Error creating course");
    }
  };

  return (
    <div className="admin-form">
      <h2>Create Course with Quizzes</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course Title:</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
          />
        </div>

        <h3>Quizzes</h3>
        {quizzes.map((quiz, index) => (
          <div key={index} className="quiz-form">
            <label>Question:</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => handleQuizChange(index, "title", e.target.value)}
              required
            />

            <label>Option 1:</label>
            <input
              type="text"
              value={quiz.option_1}
              onChange={(e) => handleQuizChange(index, "option_1", e.target.value)}
              required
            />

            <label>Option 2:</label>
            <input
              type="text"
              value={quiz.option_2}
              onChange={(e) => handleQuizChange(index, "option_2", e.target.value)}
              required
            />

            <label>Option 3:</label>
            <input
              type="text"
              value={quiz.option_3}
              onChange={(e) => handleQuizChange(index, "option_3", e.target.value)}
              required
            />

            <label>Option 4:</label>
            <input
              type="text"
              value={quiz.option_4}
              onChange={(e) => handleQuizChange(index, "option_4", e.target.value)}
              required
            />

            <label>Answer:</label>
            <input
              type="text"
              value={quiz.answer}
              onChange={(e) => handleQuizChange(index, "answer", e.target.value)}
              required
            />

            <hr />
          </div>
        ))}

        <button type="button" onClick={addQuiz}>
          + Add Another Quiz
        </button>

        <br />
        <button type="submit">Save Course</button>
      </form>
    </div>
  );
}
