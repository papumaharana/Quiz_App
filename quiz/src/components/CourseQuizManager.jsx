import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CourseQuizManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8000/courses/");
      setCourses(res.data);
    } catch (err) {
      setError("Error fetching courses : "+ err)
      // console.error("Error fetching courses", err);
    }
  };

  const viewCourse = async (courseId) => {
    try {
      const res = await axios.get(`http://localhost:8000/courses/${courseId}/quizzes/`);
      setSelectedCourse(res.data);
    } catch (err) {
      // console.error("Error fetching course details", err);
      setError("Error fetching course details :"+ err)
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await axios.delete(`http://localhost:8000/courses/${courseId}/`);
      setError(res.data.message)
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      // console.error("Error deleting course", err);
      setError("Error deleting course : "+ err)
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourseTitle(course.title);
  };

  const handleSaveCourse = async () => {
    try {
      await axios.put(`http://localhost:8000/courses/${editingCourse.id}/`, {
        title: newCourseTitle,
      });
      // alert("Course updated");
      setError("Course updated")
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      // console.error("Error updating course", err);
      setError("Error updating course : "+ err)
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`http://localhost:8000/quizzes/${quizId}/`);
      // alert("Quiz deleted");
      setError("Quiz deleted")
      viewCourse(selectedCourse.id);
    } catch (err) {
      // console.error("Error deleting quiz", err);
      setError("Error deleting quiz"+ err)
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz({ ...quiz });
  };

  const handleSaveQuiz = async () => {
    try {
      await axios.put(`http://localhost:8000/quizzes/${editingQuiz.id}/`, editingQuiz);
      // alert("Quiz updated");
      setError("Quiz updated")
      setEditingQuiz(null);
      viewCourse(selectedCourse.id);
    } catch (err) {
      // console.error("Error updating quiz", err);
      setError("Error updating quiz"+ err)
    }
  };


  return (
    <div className="admin-course-manager">
      <h2>Manage Courses</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Course List */}
      <table border="1" cellPadding="8" style={{ marginBottom: "20px" }}>
        <thead>
          <tr>
            <th></th>
            <th>Course Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id}>
              <td>{index+1}</td>
              <td>
                {editingCourse && editingCourse.id === course.id ? (
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                  />
                ) : (
                  course.title
                )}
              </td>
              <td>
                {editingCourse && editingCourse.id === course.id ? (
                  <>
                    <button onClick={handleSaveCourse}>Save</button>
                    <button onClick={() => setEditingCourse(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => viewCourse(course.id)}>View Quizzes</button>
                    <button onClick={() => handleEditCourse(course)}>Edit</button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      style={{ color: "white" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Quizzes for selected course */}
      {selectedCourse && (
        <div className="quiz-section">
          <h3>Quizzes for {selectedCourse.title}</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th></th>
                <th>Question</th>
                <th>Options</th>
                <th>Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourse.quizzes.map((quiz, index) => (
                <tr key={quiz.id}>
                  {editingQuiz && editingQuiz.id === quiz.id ? (
                    <>
                      <td>{index+1}</td>
                      <td>
                        <input
                          type="text"
                          value={editingQuiz.title}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, title: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editingQuiz.option_1}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, option_1: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={editingQuiz.option_2}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, option_2: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={editingQuiz.option_3}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, option_3: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          value={editingQuiz.option_4}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, option_4: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editingQuiz.answer}
                          onChange={(e) =>
                            setEditingQuiz({ ...editingQuiz, answer: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <button onClick={handleSaveQuiz}>Save</button>
                        <button onClick={() => setEditingQuiz(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{quiz.id}</td>
                      <td>{quiz.title}</td>
                      <td>
                        {quiz.option_1}, {quiz.option_2}, {quiz.option_3}, {quiz.option_4}
                      </td>
                      <td>{quiz.answer}</td>
                      <td>
                        <button onClick={() => handleEditQuiz(quiz)}>Edit</button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          style={{ color: "white" }}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
