from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends

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
    allow_origins=["http://localhost:5173"],  # React dev server
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


@app.post("/sent_otp/")
def send_otp(student: StudentLogin, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.email == student.email).first()

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



@app.post("/verify_otp/")
def verify_otp(data: VerifyOtp, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.email == data.email).first()

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


@app.get("/students/")
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

@app.get("/courses/")
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


# Added course with quizzes:
# @app.post("/courses")
# def create_course(course: CourseCreate, db: Session = Depends(get_db)):
#     # Create course
#     new_course = Course(title=course.title)
#     db.add(new_course)
#     db.commit()
#     db.refresh(new_course)

#     # Create quizzes for this course
#     for q in course.quizzes:
#         quiz = Quiz(
#             title=q.title,
#             option_1=q.option_1,
#             option_2=q.option_2,
#             option_3=q.option_3,
#             option_4=q.option_4,
#             answer=q.answer,
#             course_id=new_course.id
#         )
#         db.add(quiz)

#     db.commit()
#     return {
#         "message": f"Course '{new_course.title}' created with {len(course.quizzes)} quizzes"
#     }


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

