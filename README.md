# Task Manager API

A simple and secure RESTful API for managing personal tasks, built with **ASP.NET Core**, **Entity Framework Core**, and **JWT authentication**.

## 🔧 Features

- User registration & login (JWT-based authentication)
- CRUD operations for personal tasks
- Task filtering (by completion status)
- Protected endpoints
- In-memory database (easy to swap with SQL Server)
- Swagger documentation

---

## 🛠️ Tech Stack

- ASP.NET Core Web API (.NET 6/7)
- Entity Framework Core (InMemory provider)
- JWT (JSON Web Token) Authentication
- BCrypt for password hashing
- Swagger for API documentation
- Postman for endpoint testing

---

## 📦 Getting Started

### 1. Clone the repository
git clone https://github.com/yourusername/task-manager-api.git
cd task-manager-api

### 2. Install dependancies
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package BCrypt.Net-Next

### 3. Run the application
dotnet run

The API will be available at: https://localhost:5001/swagger
