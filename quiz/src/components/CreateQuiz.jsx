import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CreateQuiz() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [quizzes, setQuizzes] = useState([
        { title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" },
    ]);
    const [error, setError] = useState("");

    // Fetch course list
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get("http://localhost:8000/courses");
                setCourses(res.data);
            } catch (err) {
                setError("Error fetching courses : " + err.message)
            }
        };
        fetchCourses();
    }, []);

    const handleQuizChange = (index, field, value) => {
        const newQuizzes = [...quizzes];
        newQuizzes[index][field] = value;
        setQuizzes(newQuizzes);
    };

    const addQuiz = () => {
        setQuizzes([
            ...quizzes,
            { title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" },
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) {
            // alert("Please select a course first.");
            setError("Please select a course first.")
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8000/courses/${selectedCourse}/quizzes`,
                { course_id: selectedCourse, quizzes: quizzes }
            );
            // alert(res.data.message);
            setError(res.data.message)
            setQuizzes([{ title: "", option_1: "", option_2: "", option_3: "", option_4: "", answer: "" }]);
        } catch (err) {
            // console.error(err);
            // alert("Error adding quizzes");
            setError("Error adding quizzes : " + err.message)
        }
    };

    return (
        <div className="create_quiz_container">
            <h2>Create Quiz for a Course</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Select Course:</label>
                    {courses.length === 0 ? (
                        <p>No courses yet</p>
                    ) : (
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Course --</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {courses.length > 0 && (
                    <>
                        <h3>Quizzes</h3>
                        {quizzes.map((quiz, index) => (
                            <div key={index} className="quiz-form">
                                <label>Question : {index+1} </label>
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
                                <select
                                    value={quiz.answer}
                                    onChange={(e) => handleQuizChange(index, "answer", e.target.value)}
                                    required >
                                    <option value="">-- Select Correct Answer --</option>
                                    <option value={quiz.option_1}>{quiz.option_1 || "Option 1"}</option>
                                    <option value={quiz.option_2}>{quiz.option_2 || "Option 2"}</option>
                                    <option value={quiz.option_3}>{quiz.option_3 || "Option 3"}</option>
                                    <option value={quiz.option_4}>{quiz.option_4 || "Option 4"}</option>
                                </select>
                                <hr />
                            </div>
                        ))}

                        <button type="button" onClick={addQuiz}>
                            + Add Another Quiz
                        </button>
                        <br />
                        <button type="submit">Save Quizzes</button>
                    </>
                )}
            </form>
        </div>
    );
}
