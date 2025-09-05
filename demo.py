# Dummy session (use Redis/DB in production)
# sessions = {}

# @app.post("/login")
# def login(userId: str = Form(...), password: str = Form(...), response: Response = None):
#     conn = get_db()
#     cursor = conn.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM admins WHERE user_id=%s AND password=%s", (userId, password))
#     admin = cursor.fetchone()
#     cursor.close()
#     conn.close()

#     if admin:
#         sessions[userId] = True
#         response.set_cookie(key="session", value=userId)  # simple session
#         return {"message": "Login successful"}
#     return {"message": "Invalid credentials"}, 401

# @app.get("/check-session")
# def check_session(request: Request):
#     session_id = request.cookies.get("session")
#     if session_id and sessions.get(session_id):
#         return {"logged_in": True}
#     return {"logged_in": False}

# @app.post("/logout")
# def logout(request: Request, response: Response):
#     session_id = request.cookies.get("session")
#     if session_id in sessions:
#         del sessions[session_id]
#     response.delete_cookie("session")
#     return {"message": "Logged out"}


# from datetime import datetime, timedelta, UTC

# a = str(datetime.now(UTC) + timedelta(minutes=3))

# b = str(datetime.now(UTC))

# print(a, b)

user_otp_store = {}
def a():
    user_otp_store["otp"] = {'hii':456, 'by':789}

a()

# print(user_otp_store[]['hii'])




# # Creating courses :
# @app.post("/create_course")
# def create_course(title: str = Form(...),  db: Session = Depends(get_db)):
#     course = Course(title=title)
#     db.add(course)
#     db.commit()
#     db.refresh(course)

#     # Add 10 quizzes
#     for i in range(1, 11):
#         quiz = Quiz(title=f"{title} Quiz {i}", course_id=course.id)
#         db.add(quiz)
#     db.commit()
#     return {"course": course.title, "quizzes": [f"{title} Quiz {i}" for i in range(1, 11)]}










# # Course CRUD operation:
# @app.put("/courses/{course_id}/")
# def update_course(course_id: int, course: dict, db: Session = Depends(get_db)):
#     db_course = db.query(Course).filter(Course.id == course_id).first()
#     if not db_course:
#         return {"error": "Course not found"}
#     db_course.title = course["title"]
#     db.commit()
#     return {"message": "Course updated"}

# @app.delete("/courses/{course_id}/")   ##because of foreign key possible or not possible
# def delete_course(course_id: int, db: Session = Depends(get_db)):
#     db_course = db.query(Course).filter(Course.id == course_id).first()
#     if not db_course:
#         return {"error": "Course not found"}
#     db.delete(db_course)
#     db.commit()
#     return {"message": "Course deleted"}


# Quiz CRUD operation: