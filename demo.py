

result = []

for i in range(1, 4):
    result.append({
            "id": "student.id",
            "name": "student.name",
            "email": "student.email",
            "score": "student.score"
        })
    
print(result)

print(len(result))

print(result[0]['name'])