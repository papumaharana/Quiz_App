from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Table, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Database connection:
url = "mysql+mysqlconnector://root:2266@127.0.0.1:3306/quiz"
engine = create_engine(url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association Table Students <-> Courses
student_course = Table(
    "student_course",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id"), primary_key=True),
    Column("course_id", Integer, ForeignKey("courses.id"), primary_key=True),
)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    otp = Column(String(100), nullable=True)
    otp_expiry = Column(DateTime(timezone=True), nullable=True)
    score = Column(Float, default=0.0)  # percentage score

    courses = relationship("Course", secondary=student_course, back_populates="students")
    attendances = relationship("AttendAndAnswer", back_populates="student")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, nullable=False)

    students = relationship("Student", secondary=student_course, back_populates="courses")
    quizzes = relationship("Quiz", back_populates="course")
    answers = relationship("AttendAndAnswer", back_populates="course")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    option_1 = Column(String(100), nullable=False)
    option_2 = Column(String(100), nullable=False)
    option_3 = Column(String(100), nullable=False)
    option_4 = Column(String(100), nullable=False)
    answer = Column(String(30), nullable=False)

    course_id = Column(Integer, ForeignKey("courses.id"))
    course = relationship("Course", back_populates="quizzes")
    answers = relationship("AttendAndAnswer", back_populates="quiz")

class AttendAndAnswer(Base):
    __tablename__ = "attend_and_answer"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    answered_option = Column(String(100), nullable=False)
    correct_option = Column(String(100), nullable=False)

    student = relationship("Student", back_populates="attendances")
    quiz = relationship("Quiz", back_populates="answers")
    course = relationship("Course", back_populates="answers")


class Admin(Base):
    __tablename__ = "admin"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False) 