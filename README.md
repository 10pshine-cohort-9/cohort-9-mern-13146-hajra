# Notes App

A full-stack, secure notes management application built with React (frontend) and Node.js/Express (backend), backed by MySQL. Authenticated users can create, edit, organize, and search personal notes through a responsive, rich-text-enabled interface, backed by a well-tested, production-grade API.

This project was built iteratively with a strong emphasis on test coverage, code quality, and maintainability — the backend maintains 100% statement, branch, function, and line coverage, and both frontend and backend are integrated with SonarQube and CodeRabbit for continuous code-quality analysis.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Application Screens](#application-screens)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Code Quality & SonarQube](#code-quality--sonarqube)
- [API Overview](#api-overview)
- [Contributing / Branching Strategy](#contributing--branching-strategy)

---

## Features

### Authentication & Authorization
- Secure user registration and login with JWT-based authentication
- Password hashing via bcrypt
- Fail-closed JWT configuration (no insecure fallback secrets in production)
- Protected routes and strict per-user data isolation (users can only access their own notes)

### Note Management
- Full CRUD operations on notes (create, read, update, delete)
- Rich text editing powered by `react-quill-new`, with secure HTML sanitization via `DOMPurify`
- Pin and archive notes independently
- Custom pastel note coloring
- Note import (`.json`, `.txt`, `.md`) and export (JSON backup, text download)
- Full-text search across note titles and content
- Filtering by pinned/archived status
- Multi-field sorting (title A–Z/Z–A, oldest/newest, recently updated)

### User Profile Management
- View and update profile details (name, profile picture)
- Secure password change flow requiring current password verification
- Profile picture upload with genuine image-content validation (magic-byte verification, not just file extension trust)

### Responsive UI
- Fully responsive Dashboard with grid/card note layouts
- Collapsible desktop sidebar and mobile slide-in navigation with overlay
- Synchronized filter state (All / Pinned / Archived) between Sidebar and Dashboard
- Global search wired through the Navbar
- Keyboard-accessible interactive elements (Enter/Space activation, proper focus handling)

### Reliability & Observability
- Structured HTTP request/response logging via `pino` and `pino-http`
- Centralized global error-handling middleware with consistent JSON error responses
- Sensitive data (authorization headers, cookies, user emails) redacted from logs
- Rate limiting on authentication endpoints

### Testing & Code Quality
- Backend: 100% test coverage (statements, branches, functions, lines) using Mocha, Chai, Sinon, and Supertest
- Frontend: Comprehensive Jest + React Testing Library suite covering components, hooks, contexts, layouts, and integration flows
- SonarQube integration for ongoing static analysis and code-smell detection
- CodeRabbit automated pull request review
- Automated Mocha global setup/teardown hooks for clean, isolated test database state

---

## Tech Stack


| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| Logging | Pino, pino-http |
| Rich Text Editing | react-quill-new, DOMPurify |
| Backend Testing | Mocha, Chai, Sinon, Supertest, nyc (Istanbul) |
| Frontend Testing | Jest, React Testing Library, Babel |
| Code Quality | SonarQube, ESLint, CodeRabbit |
| Version Control | Git |


---

## Project Structure
```
├── .coderabbit.yaml
├── .gitignore
├── database.sql
├── README.md
├── sonar-project.properties
├── SonarQube Report.pdf
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .nycrc.json
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── noteController.js
│       │   └── userController.js
│       ├── logger/
│       │   └── logger.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── uploadMiddleware.js
│       ├── models/
│       │   ├── noteModel.js
│       │   └── userModel.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── noteRoutes.js
│       │   └── userRoutes.js
│       ├── utils/
│       │   ├── jwtSecret.js
│       │   └── withErrorLogging.js
│       ├── uploads/
│       └── services/
│   └── test/
│       ├── api.test.js
│       ├── health.test.js
│       ├── noteModel.test.js
│       ├── userModel.test.js
│       ├── userAndSearch.test.js
│       ├── server.test.js
│       ├── test.setup.js
│       ├── authController.unit.test.js
│       ├── authMiddleware.unit.test.js
│       ├── errorMiddleware.unit.test.js
│       ├── noteController.unit.test.js
│       ├── noteModel.unit.test.js
│       ├── uploadMiddleware.unit.test.js
│       ├── userController.unit.test.js
│       ├── userModel.unit.test.js
│       └── helpers/
│           ├── mockRes.js
│           └── withFallback.js
│
└── frontend/
    ├── README.md
    ├── .gitignore
    ├── index.html
    ├── vite.config.js
    ├── jest.config.cjs
    ├── babel.config.cjs
    ├── eslint.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── setupTests.js
        ├── components/
        │   ├── NoteModal.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── __tests__/
        │   │   └── NoteModal.test.jsx
        │   └── common/
        │       ├── Button.jsx
        │       ├── Input.jsx
        │       ├── Loader.jsx
        │       ├── PasswordField.jsx
        │       ├── ProfileSection.jsx
        │       └── __tests__/
        │           ├── Button.test.jsx
        │           ├── Input.test.jsx
        │           └── PasswordField.test.jsx
        ├── context/
        │   ├── authContext.jsx
        │   └── __tests__/
        │       └── AuthContext.test.jsx
        ├── hooks/
        │   └── useAuthSubmit.js
        ├── layouts/
        │   ├── MainLayout.jsx
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── __tests__/
        │       ├── MainLayout.test.jsx
        │       ├── Navbar.test.jsx
        │       └── Sidebar.test.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Profile.jsx
        │   ├── NotFound.jsx
        │   └── __tests__/
        │       ├── Dashboard.branches.test.jsx
        │       ├── Dashboard.test.jsx
        │       ├── DashboardInteractions.test.jsx
        │       ├── Login.test.jsx
        │       ├── NotFound.test.jsx
        │       ├── Profile.test.jsx
        │       └── SignUp.test.jsx
        ├── routes/
        │   ├── AppRoutes.jsx
        │   └── __tests__/
        │       └── ProtectedRoute.test.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── noteService.js
        │   └── __tests__/
        │       ├── api.test.js
        │       ├── authService.test.js
        │       └── noteService.test.js
        ├── utils/
        │   ├── constants.js
        │   └── __tests__/
        │       └── constants.test.js
        └── tests/
            ├── App.test.jsx
            └── styleMock.js
```

---

## Application Screens

### 1. Sign Up / Log In
- Sign-up and login forms with validation, loading states, and clear error messaging
- Redirects to the dashboard on successful authentication

### 2. Dashboard (Notes List)
- Displays the authenticated user's notes in a responsive grid
- Search, filter (All/Pinned/Archived), and sort controls
- Entry point for creating a new note
- Import/export notes (JSON, TXT, MD)

### 3. Note Editor (Modal)
- Rich text editor for note content (`react-quill-new`)
- Pin/archive toggles and custom note coloring
- Save or cancel, returning to the dashboard

### 4. User Profile
- View and edit profile details
- Update profile picture (with content validation)
- Change password
- Log out

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- MySQL Server
- npm

### Clone the repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

---

## Environment Variables

Copy the example environment file and configure it for your local setup:

```bash
cd backend
cp .env.example .env
```

Typical variables required (refer to `backend/.env.example` for the authoritative list):

PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=notes_app

JWT_SECRET=your_jwt_secret

ALLOWED_ORIGINS=http://localhost:3000


> **Note:** `JWT_SECRET` is required and fails closed — the application will not silently fall back to an insecure default outside of the test environment.

For the frontend, configure the API base URL (e.g. via a `VITE_API_URL` environment variable) to point to your running backend instance.

---

## Database Setup

1. Create a MySQL database (default expected name: `notes_app`).
2. Run the provided schema from the project root:

```bash
mysql -u <your_user> -p notes_app < database.sql
```

This creates the `users` and `notes` tables, including:
- A foreign key relationship between `notes.user_id` and `users.id`
- Cascading deletes (a user's notes are removed when the user is deleted)
- An index on `notes.user_id` for efficient per-user note queries

---

## Running the Application

### Backend
```bash
cd backend
npm start
```
The server verifies the database connection before accepting requests and will log a clear startup failure if the connection cannot be established.

### Frontend
```bash
cd frontend
npm run dev
```

The frontend development server will start via Vite (default: `http://localhost:5173`), communicating with the backend API (default: `http://localhost:5000`).

---

## Testing

### Backend

Run the full test suite:
```bash
cd backend
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

The backend test suite includes:
- Integration tests (Supertest) covering authentication, notes CRUD, user profile management, search/filter/sort, and global error handling
- Unit tests covering model-layer database error paths, middleware edge cases, and fallback branches not reachable via HTTP
- Isolated database cleanup via Mocha global setup/teardown hooks (`test.setup.js`)
- Shared test helpers (`test/helpers/mockRes.js`, `test/helpers/withFallback.js`) to avoid duplicated test logic

**Current backend coverage: 100% statements, branches, functions, and lines.**

### Frontend

Run the test suite:
```bash
cd frontend
npm test
```

The frontend test suite (Jest + React Testing Library) covers components, contexts, hooks, layouts, and integration flows across authentication, dashboard interactions, note editing, import/export, and responsive navigation.

---

## Code Quality & SonarQube

This project is integrated with **SonarQube** for continuous static analysis, covering:
- Code coverage (imported from `nyc`/Istanbul `lcov` reports on the backend, Jest coverage on the frontend)
- Code smells and maintainability
- Duplication detection
- Security hotspots

Shared utility modules (`backend/src/utils/jwtSecret.js`, `backend/src/utils/withErrorLogging.js`) were extracted specifically to reduce code duplication flagged during code-quality review.

Two `istanbul ignore` annotations exist in the frontend codebase (`services/api.js`, `layouts/Navbar.jsx`), each documented inline with the reasoning and verification method confirming the associated branches are genuinely untestable in a Jest environment (due to build-time environment variable transforms), rather than simply difficult to cover.

CodeRabbit is configured via `.coderabbit.yaml` to provide automated review feedback on pull requests.

---

## API Overview

All endpoints are prefixed as shown below and require a valid `Authorization: Bearer <token>` header unless otherwise noted.

### Auth (`/api/auth`) — public
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate and receive a JWT |

### Users (`/api/users`) — protected
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get the authenticated user's profile |
| PUT | `/profile` | Update name and/or profile picture |
| PUT | `/change-password` | Change password (requires current password) |

### Notes (`/api/notes`) — protected
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a note |
| GET | `/` | Get all notes for the authenticated user |
| GET | `/pinned` | Get pinned notes |
| GET | `/archived` | Get archived notes |
| GET | `/search` | Search/filter/sort notes (`q`, `pinned`, `archived`, `sort`) |
| GET | `/:id` | Get a single note by ID |
| PUT | `/:id` | Update a note |
| DELETE | `/:id` | Delete a note |
| PATCH | `/:id/pin` | Toggle pin status |
| PATCH | `/:id/archive` | Toggle archive status |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Basic health check |

---

## Contributing / Branching Strategy

This project follows a **forked-repository, feature-branch workflow**, with mentor-reviewed pull requests merged into a shared `develop` branch. Development proceeded incrementally through the following stages:

1. Backend project initialization (Express, Pino, environment configuration)
2. Frontend project initialization (React + Vite, routing)
3. Database schema and data-access models
4. Authentication, authorization, and notes API
5. User profile management and note search/filtering
6. Frontend authentication flow, profile UI, and backend test automation
7–8. Dashboard, rich text editor, and note modal implementation
9. Note import/export, responsive Sidebar/Navbar, filter synchronization
10. Frontend test coverage and code quality cleanup
11. Backend code cleanup, shared utility extraction, and full test coverage

Each pull request is expected to:
- Pass the full existing test suite with no regressions
- Maintain or improve test coverage
- Address relevant CodeRabbit and SonarQube feedback before merge

---

## License

This project was developed as part of a structured software development internship program.