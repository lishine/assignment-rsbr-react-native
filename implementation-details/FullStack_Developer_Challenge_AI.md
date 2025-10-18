# Full Stack Developer Challenge

## Overview

This challenge evaluates your ability to design and deliver a small but complete product with both frontend and backend parts. You will build a simple mobile application with a backend API and database, demonstrating code quality, architecture, and UX thinking.

We encourage the use of AI tools. You are welcome to use any AI assistance during the process. Please include a short note in your `README` explaining where and how AI was used, which tools were involved, and what value they provided. Transparency and thoughtful use of AI will be considered a positive aspect of your submission.

---

## Goal

Create a small **CRUD-based mobile app** (React Native with TypeScript) connected to a backend (Node.js with TypeScript or Python) using a database. The app should include at least **two screens** (Login and a Main page) and demonstrate full CRUD functionality.

---

## Frontend Requirements (React Native + TypeScript)

-   At least **two screens**: Login and Main (list, detail, or form)
-   **Authentication** integrated with backend
-   **CRUD** for a chosen entity (e.g., products, tasks, or contacts)
-   Handle **loading**, **errors**, and **validations**
-   Provide **clear documentation** on running the app and building an APK

---

## Backend Requirements (Node.js or Python)

-   REST API with authentication and CRUD operations
-   JWT or similar login method
-   Database: PostgreSQL, MySQL, or SQLite
-   Include **seed data**
-   Expose **API documentation** (Swagger or OpenAPI preferred)
-   All services must run via **Docker** and **Docker Compose**

---

## DevOps and Delivery

-   Use **Docker** and **docker-compose** to set up backend and database
-   Provide a `.env.example` file with environment variables
-   Include a `README` containing:
    -   Setup and run instructions
    -   API endpoints and login details
    -   APK build instructions
    -   Notes on your approach, AI usage, and possible improvements

---

## Submission

Submit your work via **GitHub** (public or private repository).  
The repository should include the following structure:

```
backend/
mobile/
docker-compose.yml
.env.example
README.md
```

After cloning, the project should run using a single command:

```bash
docker compose up --build
```

---

## Evaluation Criteria

Submissions will be reviewed based on:

-   Code quality and structure
-   Architecture and modularity
-   API correctness
-   UI and usability
-   Documentation clarity
-   Transparency in AI usage
-   Ease of setup and reproducibility
-   **Bonus points** for creativity, UX polish, or product improvement ideas

---

## Timebox

The task is expected to take around **7 hours** in total.  
Focus on clarity, structure, and maintainability rather than completeness.

---

## Optional Extras

Additional points may be awarded for:

-   Role-based access
-   File uploads
-   Search or sort filters
-   Offline behavior
-   Light testing

---

**Good luck!**  
Build something you would be proud to show in production.

© Roseberry
