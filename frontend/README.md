# Notes Application

## Overview

Notes Application is a full-stack web application that allows users to create, manage, and organize their personal notes.

The application is designed to support user authentication, note management, database integration, application logging, exception handling, unit testing, and code quality analysis.

The project is currently under development. The current phase focuses on establishing the frontend and backend development environments with the required project structure, dependencies, and configurations.

---

## Technology Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Jest (Testing)

### Backend

- Node.js
- Express.js
- MySQL
- Pino Logger
- Mocha & Chai (Testing)

### Development Tools

- Git & GitHub
- ESLint
- Prettier
- SonarQube

---

# Project Structure

```
Notes Application
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── logger
│   │   └── routes
│   │
│   ├── test
│   │   └── health.test.js
│   │
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── frontend
    ├── src
    │   ├── assets
    │   ├── components
    │   ├── pages
    │   ├── routes
    │   ├── services
    │   └── utils
    │
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

# Current Implementation

## Backend Setup

The backend development environment has been initialized with:

- Node.js project setup
- Express.js server configuration
- Backend folder structure
- Environment variable configuration using `.env.example`
- CORS configuration
- Pino logger setup
- Required backend dependencies installation
- MySQL and authentication related dependencies installation for future development
- Mocha testing setup
- Backend health check API endpoint
- Initial backend test configuration

---

## Frontend Setup

The frontend development environment has been initialized with:

- React application setup using Vite
- React Router configuration
- Initial frontend folder structure
- Application routing setup
- Initial application pages:
  - Login
  - Signup
  - Dashboard
  - NotFound
- Axios dependency installation for future API communication
- Jest dependency installation for frontend testing

---

# Installation and Setup

## Prerequisites

Before running the project, make sure the following tools are installed:

- Node.js
- npm
- Git

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
.env
```

Add required environment variables according to `.env.example`.

Start the backend server:

```bash
npm run dev
```

Run backend tests:

```bash
npm test
```

---

# Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

---

# Testing

## Backend Testing

Backend testing is configured using:

- Mocha
- Chai

Run backend tests:

```bash
npm test
```

---

## Frontend Testing

Frontend testing will be implemented using:

- Jest

Frontend tests will be added as application features are developed.

---

# Development Workflow

The project follows a feature branch workflow using Git.

Workflow:

```
develop
   |
   |
feature branch
   |
   |
Pull Request
   |
   |
develop
```

Development guidelines:

- Create separate branches for new features.
- Keep commits focused and meaningful.
- Create Pull Requests for review.
- Rebase feature branches with the latest develop branch when required.
- Maintain clean Git history.

---

# Planned Features

## User Authentication

Future implementation will include:

- User registration
- User login
- User logout
- Authorization handling

---

## Notes Management

Future implementation will include:

- Create notes
- View notes
- Edit notes
- Delete notes
- Rich text editing support

---

## Database Integration

Future implementation will include:

- User data storage
- Notes data storage
- MySQL database integration

---

## Application Improvements

Future development will include:

- REST API development
- Global exception handling
- Application logging
- User activity logging
- Backend and frontend unit testing
- SonarQube integration

---

# Code Quality

The project uses the following tools to maintain code quality:

- ESLint for identifying code issues
- Prettier for consistent formatting
- SonarQube for static code analysis

---

# Contribution Guidelines

To contribute:

1. Create a feature branch.
2. Implement required changes.
3. Test changes locally.
4. Commit changes with meaningful messages.
5. Create a Pull Request targeting the develop branch.
6. Address review feedback.

---

# License

This project is developed as part of the 10Pearls internship program.