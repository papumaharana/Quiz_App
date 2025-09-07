import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShowAnswers() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState("");

    // 1️⃣ Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get("http://localhost:8000/students");
                setStudents(res.data);
            } catch (err) {
                setError("Failed to load students: " + err.message);
            }
        };
        fetchStudents();
    }, []);

    // 2️⃣ When student is selected → fetch courses
    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        setCourses([]);
        setQuizzes([]);
        setSelectedCourse("");

        if (!studentId) return;
        try {
            const res = await axios.get(`http://localhost:8000/student_courses/${studentId}`);
            setCourses(res.data);
        } catch (err) {
            setError("Failed to load courses: " + err.message);
        }
    };

    // 3️⃣ When course is selected → fetch quizzes
    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setQuizzes([]);
        if (!courseId || !selectedStudent) return;

        try {
            const res = await axios.get(
                `http://localhost:8000/students/${selectedStudent}/courses/${courseId}/quizzes`
            );
            setQuizzes(res.data.quizzes || []);
        } catch (err) {
            setError("Failed to load quizzes: " + err.message);
        }
    };

    return (
        <div className="result_container">
            <h2>Show Student Answers</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Select Student */}
            <div>
                <label>Select Student: </label>
                <select
                    value={selectedStudent}
                    onChange={(e) => handleStudentChange(e.target.value)}
                >
                    <option value="">-- Select Student --</option>
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.email}
                        </option>
                    ))}
                </select>
            </div>

            {/* Select Course (radio buttons) */}
            {courses.length > 0 && (
                <div>
                    <h3>Courses</h3>
                    {courses.map((course) => (
                        <div key={course.id}>
                            <label>
                                <input
                                    type="radio"
                                    name="course"
                                    value={course.id}
                                    checked={selectedCourse === course.id}   // ✅ keep it marked
                                    onChange={() => handleCourseChange(course.id)}
                                />
                                {course.title}
                            </label>
                        </div>
                    ))}

                </div>
            )}

            {/* Quizzes Table */}
            {quizzes.length > 0 && (
                <div>
                    <h3>Quizzes</h3>
                    <table border="1" cellPadding="8">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Answered</th>
                                <th>Correct Option</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map((quiz) => (
                                <tr key={quiz.id}>
                                    <td>{quiz.title}</td>
                                    <td>{quiz.answered_option}</td>
                                    <td>{quiz.answer}</td>
                                    <td>
                                        {quiz.answered_option === quiz.answer ? (
                                            <span>✔</span>
                                        ) : (
                                            <span>✘</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
