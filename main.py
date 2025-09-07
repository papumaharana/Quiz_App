from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, Body

from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import *

from schema import *
from hash_password import hash_password, verify_password
from contextlib import asynccontextmanager
from send_email import send_email_smtp
from random import randint
from datetime import datetime, timedelta, UTC, timezone

# Creating 1st admin:
@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()
    if db.query(Admin).count() == 0:
        default_admin = Admin(
            user_name="admin",
            email="mpapu177@gmail.com",
            password=hash_password("1234")
        )
        db.add(default_admin)
        db.commit()
    db.close()
    
    yield  


app = FastAPI(lifespan=lifespan)

# CORS so frontend (React) can talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#create tables if not exts in db:
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return "FastApi running...."

# Admin login
@app.post("/admin/login/")
def login_admin(admin: AdminLogin, db: Session = Depends(get_db)):
    db_admin = db.query(Admin).filter(or_(Admin.email == admin.email, Admin.user_name == admin.email)).first()
    if not db_admin or not verify_password(admin.password, db_admin.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "success": True,
        "id": db_admin.id,
        "user_name": db_admin.user_name,
        "email": db_admin.email
    }

# Send Otp:
@app.post("/sent_otp/")
def send_otp(student: StudentLogin, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter_by(email=student.email).first()

    otp = str(randint(100000, 999999))  # 6-digit OTP
    expiry_time = datetime.now(timezone.utc) + timedelta(minutes=3)

    if not db_student:
        # New student
        new_student = Student(
            name=student.name,
            email=student.email,
            otp=otp,
            otp_expiry=expiry_time
        )
        db.add(new_student)
    else:
        # Existing student update OTP
        db_student.otp = otp
        db_student.otp_expiry = expiry_time

    db.commit()
    send_email_smtp(student.email, otp)

    return {"success": True, "message": "OTP sent successfully!"}


# Verify OTP:
@app.post("/verify_otp/")
def verify_otp(data: VerifyOtp, db: Session = Depends(get_db)):
    student = db.query(Student).filter_by(otp=data.otp).first()

    if not student or not student.otp or not student.otp_expiry:
        return {"success": False, "message": "OTP not found. Please request again."}

    # Ensure datetime is timezone-aware
    expiry = student.otp_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expiry:
        return {"success": False, "message": "OTP expired. Please request again."}

    if student.otp != data.otp:
        return {"success": False, "message": "Invalid OTP."}

    # clear OTP
    student.otp = None
    student.otp_expiry = None
    db.commit()

    return {
        "success": True,
        "message": "OTP verified successfully",
        "student": {"id": student.id, "name": student.name, "email": student.email}
        }

# Get all students and courses:
@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

@app.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


# Creating courses :
@app.post("/create_course")
def create_course(course:CreateCourse, db:Session=Depends(get_db)):
    course_db = db.query(Course).filter(Course.title == course.course).first()

    if course_db:
        return {"message": f"Course {course.course} already exits!"}

    new_course = Course(title=course.course)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return {"message": f"Course {course.course} added!"}



# Asign students with courses:
@app.post("/assign_course")
def assign_course(data: AssignCourse, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    course = db.query(Course).filter(Course.id == data.course_id).first()

    if not student or not course:
        return {"error": "Student or Course not found"}

    # Assign course to student (Many-to-Many)
    student.courses.append(course)
    db.commit()

    return {"message": f"Student {student.name} assigned to course {course.title}"}



# Get students with there courses:
@app.get("/students-with-courses/")
def get_students_with_courses(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    result = []
    for student in students:
        result.append({
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "courses": [{"id": c.id, "title": c.title} for c in student.courses]
        })
    return result

# Unassign student from course:
@app.delete("/unassign-course/")
def unassign_course(student_id: int, course_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    course = db.query(Course).filter(Course.id == course_id).first()

    if not student or not course:
        raise HTTPException(status_code=404, detail="Student or Course not found")

    if course in student.courses:
        student.courses.remove(course)
        db.commit()
        return {"message": f"Course '{course.title}' removed from Student '{student.name}'"}
    else:
        raise HTTPException(status_code=400, detail="Course not assigned to this student")

# Create quizzes:
@app.post("/courses/{course_id}/quizzes")
def add_quizzes(course_id: int, payload: QuizPayload, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return {"message": "Course not found"}

    for quiz in payload.quizzes:
        new_quiz = Quiz(
            title=quiz.title,
            option_1=quiz.option_1,
            option_2=quiz.option_2,
            option_3=quiz.option_3,
            option_4=quiz.option_4,
            answer=quiz.answer,
            course_id=course_id,
        )
        db.add(new_quiz)

    db.commit()
    return {"message": f"{len(payload.quizzes)} quizzez added to {course.title}"}

@app.get("/courses/{course_id}/quizzes/")
def get_course_quizzes(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return {"message": "Course not found"}
    return {"id": course.id, "title": course.title, "quizzes": course.quizzes}


@app.put("/courses/{course_id}/")
def update_course(course_id: int, data: dict, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return {"message": "Course not found"}
    if course.title == data.get("title", course.title):
        return {"message": "Course already exits"}
    course.title = data.get("title", course.title)
    db.commit()
    db.refresh(course)
    return {"message": "Course updated."}


@app.delete("/courses/{course_id}/")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return {"message": "Course not found"}
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}


# ---------- QUIZ ROUTES ----------
# @app.post("/courses/{course_id}/quizzes/")
# def add_quiz(course_id: int, data: dict, db: Session = Depends(get_db)):
#     course = db.query(Course).filter(Course.id == course_id).first()
#     if not course:
#         raise HTTPException(status_code=404, detail="Course not found")

#     quiz = Quiz(
#         title=data["title"],
#         option_1=data["option_1"],
#         option_2=data["option_2"],
#         option_3=data["option_3"],
#         option_4=data["option_4"],
#         answer=data["answer"],
#         course_id=course_id,
#     )
#     db.add(quiz)
#     db.commit()
#     db.refresh(quiz)
#     return quiz


@app.put("/quizzes/{quiz_id}/")
def update_quiz(quiz_id: int, data: dict, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz.title = data.get("title", quiz.title)
    quiz.option_1 = data.get("option_1", quiz.option_1)
    quiz.option_2 = data.get("option_2", quiz.option_2)
    quiz.option_3 = data.get("option_3", quiz.option_3)
    quiz.option_4 = data.get("option_4", quiz.option_4)
    quiz.answer = data.get("answer", quiz.answer)

    db.commit()
    db.refresh(quiz)
    return quiz


@app.delete("/quizzes/{quiz_id}/")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted"}

# Get all Courses for perticular student:
@app.get("/student_courses/{student_id}")
def get_student_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"message": "Student not found"}

    if not student.courses:
        return {"message": "No courses assigned"}

    return student.courses



# ----------Attend quiz and submit answers------------ :


@app.get("/student_courses/{student_id}")
def get_student_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"message": "Student not found"}
    return [{"id": c.id, "title": c.title} for c in student.courses]


@app.get("/check_attempt/{student_id}/{course_id}")
def check_attempt(student_id: int, course_id: int, db: Session = Depends(get_db)):
    attempt = db.query(AttendAndAnswer).filter(
        AttendAndAnswer.student_id == student_id,
        AttendAndAnswer.course_id == course_id
    ).first()
    return {"attempted": bool(attempt)}


@app.get("/course/{course_id}/quizzes")
def get_quizzes(course_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "option_1": q.option_1,
            "option_2": q.option_2,
            "option_3": q.option_3,
            "option_4": q.option_4,
        }
        for q in quizzes
    ]


@app.post("/submit_answer/{student_id}/{course_id}/{quiz_id}")
def submit_answer(student_id: int, course_id: int, quiz_id: int, data: dict = Body(...), db: Session = Depends(get_db)):
    answered_option = data.get("answered_option")

    record_quiz = db.query(AttendAndAnswer).filter(
        AttendAndAnswer.student_id == student_id,
        AttendAndAnswer.course_id == course_id,
        AttendAndAnswer.quiz_id == quiz_id
    ).first()
    if record_quiz:
        return {"message": "You have already answered this quiz"}
    
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.course_id == course_id).first()
    if not quiz:
        return {"message": "Quiz not found"}

    attend = AttendAndAnswer(
        student_id=student_id,
        course_id=course_id,
        quiz_id=quiz_id,
        answered_option=answered_option,
        correct_option=quiz.answer,
    )
    db.add(attend)
    db.commit()
    return {"message": "Answer saved"}

# Respected score of student in perticular course:
@app.get("/student_score/{student_id}/{course_id}")
def get_student_score(student_id: int, course_id: int, db: Session = Depends(get_db)):
    answers = db.query(AttendAndAnswer).filter(
        AttendAndAnswer.student_id == student_id,
        AttendAndAnswer.course_id == course_id
    ).all()

    if not answers:
        return {"score": None}

    total = len(answers)
    correct = sum(1 for ans in answers if ans.answered_option == ans.correct_option)
    percentage = round((correct / total) * 100, 2)
    return {"score": percentage}


@app.get("/total_score/{student_id}")
def get_total_score(student_id: int, db: Session = Depends(get_db)):
    student_answers = db.query(AttendAndAnswer).filter_by(student_id=student_id).all()
    db_student = db.query(Student).filter_by(id=student_id).first()

    if not student_answers:
        return {"message":"Attempts not found"}

    total_attempts = len(student_answers)
    total_score = 0
    for answer in student_answers:
        if answer.answered_option == answer.correct_option:
            total_score += 1

    total_score = (total_score / total_attempts) * 100 if total_attempts > 0 else 0

    db_student.score = total_score
    db.commit()
    return {"total_score": round(total_score, 2)}