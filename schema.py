from pydantic import BaseModel, EmailStr
from typing import List

class QuizCreate(BaseModel):
    title: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    answer: str

class CourseCreate(BaseModel):
    title: str
    quizzes: List[QuizCreate]   # List of quizzes with options

class CreateCourse(BaseModel):
    course:str

class AssignCourse(BaseModel):
    student_id: int
    course_id: int


class AdminLogin(BaseModel):
    email: str
    password: str

class StudentLogin(BaseModel):
    name: str
    email: EmailStr

class VerifyOtp(BaseModel):
    email: str
    otp: str
