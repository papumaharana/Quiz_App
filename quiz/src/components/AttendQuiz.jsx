import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AttendQuiz() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const student = JSON.parse(localStorage.getItem("student"));

    const [quizzes, setQuizzes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(
        parseInt(localStorage.getItem("quizIndex") || 0)
    );
    const [selectedOption, setSelectedOption] = useState("");
    const [loading, setLoading] = useState(true);

    // 🚫 Prevent refresh/back
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ""; // modern browsers require this
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!student) {
            navigate("/");
            return;
        }

        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8000/course/${courseId}/quizzes`
                );
                setQuizzes(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, [courseId, student, navigate]);

    const handleNext = async () => {
        if (!selectedOption) return alert("Please select an option");

        const quiz = quizzes[currentIndex];
        await axios.post(
            `http://localhost:8000/submit_answer/${student.id}/${courseId}/${quiz.id}`,
            { answered_option: selectedOption }
        );

        setSelectedOption("");

        if (currentIndex + 1 < quizzes.length) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            localStorage.setItem("quizIndex", nextIndex);
        } else {
            alert("Quiz Finished!");
            localStorage.removeItem("quizIndex"); // clear progress
            navigate("/studentdashboard");
        }
    };

    if (loading) return <h3>Loading quizzes...</h3>;

    if (quizzes.length === 0) return <h3>No quizzes found for this course.</h3>;

    const currentQuiz = quizzes[currentIndex];

    return (
        <div className="quiz_container">
            <h2>
                Quiz {currentIndex + 1} of {quizzes.length}
            </h2>
            <h3>{currentIndex + 1}. {currentQuiz.title}</h3>

            <div className="options_container">
                {[currentQuiz.option_1, currentQuiz.option_2, currentQuiz.option_3, currentQuiz.option_4].map(
                    (opt, idx) => (
                        <div key={idx}>
                            <label>
                                <input
                                    type="radio"
                                    name="option"
                                    value={opt}
                                    checked={selectedOption === opt}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                />
                                {opt}
                            </label>
                        </div>
                    )
                )}
            </div>

            <button onClick={handleNext}>
                {currentIndex + 1 === quizzes.length ? "Finish" : "Next"}
            </button>
        </div>
    );
}

export default AttendQuiz;
