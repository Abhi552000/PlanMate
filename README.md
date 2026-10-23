# PlanMate - Enterprise Agile Scrum & Project Management Platform

PlanMate is an industry-standard, full-stack Agile Scrum management dashboard designed to organize, plan, execute, and analyze software development workflows. Built with modern web technologies, PlanMate provides teams with interactive sprint planning, dynamic drag-and-drop Kanban boards, backlog management, epic tracking, analytics dashboards, multi-tenant organization management, and real-time user notifications.

---

## 💡 What is PlanMate? (In Plain English / For a Layman)

Think of **PlanMate** as a smart digital command center for building software projects—similar to tools like Jira, Trello, or Asana.

* **For Developers & Team Members**: It's a clear visual board showing what tasks need to be done, what's currently being worked on, and what's completed. You can leave comments, mention teammates (`@name`), track due dates, and update progress with a click.
* **For Project Managers**: It lets you organize work into timed chunks (called **Sprints**), group big project goals (called **Epics**), assign tasks to team members, and view automated charts showing if the project is on track to finish on time.
* **For Company Admins**: It provides a unified workspace to manage company members, control user permissions, set custom workflows, and track overall team productivity.

---

## 🚀 Quick Links & Table of Contents

- [What is PlanMate? (For a Layman)](#-what-is-planmate-in-plain-english--for-a-layman)
- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Third-Party Libraries & Dependencies](#-third-party-libraries--dependencies)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Core Services & Methods](#-core-services--methods)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Coding Standards & Architectural Best Practices](#-coding-standards--architectural-best-practices)
- [Getting Started & Installation](#-getting-started--installation)
- [Deployment](#-deployment)

---

## 🎯 Overview & Architecture

PlanMate adopts a decoupled client-server architecture with a **React 19 + TypeScript** Single Page Application (SPA) frontend powered by **Vite**, and a scalable **Node.js + Express 5** RESTful API backend connected to **MongoDB**.


```
                           +-----------------------------------+
                           |        PlanMate Web Application   |
                           |       (React 19 + TypeScript)     |
                           +-----------------+-----------------+
                                             |
                                  REST API / HTTP Requests
                                             |
                                             v
                           +-----------------+-----------------+
                           |        PlanMate REST Backend      |
                           |        (Node.js + Express 5)      |
                           +-----------------+-----------------+
                                             |
                                     Mongoose ODM
                                             |
                                             v
                           +-----------------+-----------------+
                           |          MongoDB Database         |
                           +-----------------------------------+
```

---

## ✨ Key Features

### 1. 🔄 Agile Sprint & Backlog Planning
- **Sprint Management**: Create, start, complete, and soft-close sprints with start/end dates and sprint goals. Sprints are preserved historically without destructive DB deletion.
- **Backlog Management**: Drag-and-drop/structured sprint assignment, story point estimations, and backlog task prioritization.
- **Epic Grouping**: Color-coded Epics with dedicated progress tracking and task association.

### 2. 📋 Interactive Kanban Board
- **Multi-Column Status Pipeline**: Configurable columns (`To Do`, `In Progress`, `In Review`, `Done`, and custom organization statuses).
- **Interactive Board Filters**: Real-time filtering by assignee, priority (`High`, `Medium`, `Low`), Epic, and keyword search.

### 3. 📝 Comprehensive Task Lifecycle & Subtask System
- **Issue Types**: Support for `Story`, `Task`, `Bug`, and `Epic`.
- **Estimation & Work Logs**: Original estimation, time logged, remaining estimate, and detailed work logs.
- **Interactive Subtasks**: Subtask creation, status toggles, and detail view drills.
- **Task Dependencies & Linking**: Link tasks with relationships (`blocks`, `blocked by`, `relates to`).
- **Audit History / Activity Timeline**: Automatic tracking of field modifications (status, priority, assignee, story points) with user attribution.
- **Rich Comments with `@mentions`**: Interactive task comments with user mention suggestions and notification triggers.

### 4. 📅 Interactive Calendar View
- Visual month/week grid displaying task due dates, sprint deadlines, and delivery milestones.

### 5. 📊 Analytics & Burndown Dashboard
- **Sprint Burndown Charts**: Visual comparison of ideal vs. actual remaining story points/work.
- **Velocity Tracking**: Sprint-over-sprint completion velocity metrics.
- **Workload Distribution**: Visual distribution breakdown by assignee and task priority using **Recharts**.
- **Epic Progress Visualization**: Percentage completion tracking per Epic.

### 6. 🏢 Multi-Tenant Organization & Role-Based Access Control (RBAC)
- **Role Hierarchy**: System Administrator (`system-admin`), Organization Administrator (`org-admin`), and Organization Member (`member`).
- **Custom Workflows**: Define and manage custom task statuses per organization.
- **Member Onboarding**: Organization signup, member invitation, user activation/deactivation.

### 7. 🔔 Real-Time Notification Center
- Notifications for task assignments, `@mentions`, status changes, and administrative actions.
- Mark individual notifications as read or bulk mark all as read.

### 8. 👤 User Profile & Workspace Settings
- Profile avatar updates, contact info management, and secure password changes.

---

## 🛠 Technology Stack

### Frontend Stack
- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool & Dev Server**: [Vite 6](https://vitejs.dev/)
- **State Management**: [Redux Toolkit 2](https://redux-toolkit.js.org/) + [React-Redux 9](https://react-redux.js.org/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **Styling & UI**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts 3](https://recharts.org/)
- **Date Utilities**: [Date-fns 4](https://date-fns.org/)
- **Toast Notifications**: [React Toastify 11](https://fkhadra.github.io/react-toastify/)
- **HTTP Client**: [Axios 1](https://axios-http.com/)

### Backend Stack
- **Runtime Environment**: [Node.js](https://nodejs.org/) (ES Modules)
- **Web Framework**: [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Authentication & Security**: [JSON Web Token (JWT)](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) / [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- **Utilities**: `cors`, `dotenv`, `validator`, `body-parser`, `nodemon`

---

## 📦 Third-Party Libraries & Dependencies

### Frontend Dependencies (`frontend/package.json`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.1.0` | UI Component Framework |
| `@reduxjs/toolkit` | `^2.12.0` | Global State Management (Slices & Thunks) |
| `react-redux` | `^9.3.0` | React bindings for Redux |
| `react-router-dom` | `^7.6.1` | Client-side Routing & Route Guards |
| `axios` | `^1.10.0` | HTTP Client for Centralized API Services |
| `recharts` | `^3.10.1` | Burndown, Velocity & Analytics Charts |
| `tailwindcss` / `@tailwindcss/vite` | `^4.1.7` | Utility-First Styling Framework |
| `lucide-react` | `^0.513.0` | SVG Icon Library |
| `date-fns` | `^4.1.0` | Date Formatting and Duration Calculations |
| `react-toastify` | `^11.0.5` | Toast Alerts & Feedback Notifications |
| `typescript` | `^5.3.3` | Static Type Checking |
| `vite` | `^6.3.5` | Bundler & Development Server |

### Backend Dependencies (`backend/package.json`)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | `^5.1.0` | REST API Server Framework |
| `mongoose` | `^8.15.1` | MongoDB Object Data Modeling (ODM) |
| `jsonwebtoken` | `^9.0.2` | JWT Authentication & Access Tokens |
| `bcrypt` / `bcryptjs` | `^6.0.0` / `^3.0.2` | Password Hashing & Verification |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing Middleware |
| `dotenv` | `^16.5.0` | Environment Variable Management |
| `validator` | `^13.15.0` | String and Email Validation |
| `body-parser` | `^2.2.0` | Request Body Parsing Middleware |
| `nodemon` | `^3.1.10` | Auto-reloading Development Server |

---

## 📁 Project Architecture & Directory Structure

```
PlanMate/
├── backend/                        # Node.js + Express REST API
│   ├── config/                     # Database connection setup (db.js)
│   ├── constants/                  # Server-side constants & defaults
│   ├── controllers/                # Request handlers & business logic
│   │   ├── epicController.js       # Epic CRUD & task linkage
│   │   ├── notificationController.js# User notifications management
│   │   ├── organizationController.js# Tenant, members, roles, statuses
│   │   ├── sprintController.js     # Sprint lifecycle (start, complete, soft-close)
│   │   ├── taskContoller.js        # Tasks, comments, subtasks, worklogs, history
│   │   └── userController.js       # Authentication, registration, profile
│   ├── middleware/                 # Auth verification, error handling, RBAC
│   │   ├── auth.js                 # JWT token validation
│   │   └── errorHandler.js         # Centralized error handler
│   ├── models/                     # Mongoose Schemas & Models
│   │   ├── epicModel.js
│   │   ├── notificationModel.js
│   │   ├── organizationModel.js
│   │   ├── sprintModel.js
│   │   ├── taskModel.js
│   │   └── userModel.js
│   ├── routes/                     # Express route definitions
│   ├── server.js                   # Application entry point & middleware registration
│   ├── package.json
│   └── vercel.json                 # Backend serverless deployment config
│
├── frontend/                       # React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/             # Reusable & feature UI components
│   │   │   ├── analytics/          # Chart widgets & metric cards
│   │   │   ├── kanban/             # Board columns, drag items, search
│   │   │   ├── navbar/             # Navigation header & notification dropdown
│   │   │   ├── task-modal/         # Task modal tabs (General, Subtasks, Activity, Comments)
│   │   │   ├── ui/                 # Reusable buttons, inputs, modals
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── MentionInput.tsx    # Rich comment editor with @user suggestions
│   │   ├── config/                 # Environment & global app config
│   │   ├── constants/              # Centralized route strings & UI messages
│   │   │   ├── routes.ts           # Centralized API_ROUTES mapping
│   │   │   ├── messages.ts         # TOAST_MESSAGES & CONSOLE_ERRORS
│   │   │   └── uiTexts.ts          # Static UI copy & headings
│   │   ├── context/                # React Context providers (AuthContext)
│   │   ├── pages/                  # Page-level components & feature views
│   │   │   ├── dashboard/          # Active Sprint, Backlog, Epics dashboard
│   │   │   ├── org-admin/          # Organization member & workflow administration
│   │   │   ├── sys-admin/          # System-wide platform settings
│   │   │   ├── task-detail/        # Dedicated task view page
│   │   │   ├── CalendarViewPage.tsx# Interactive task/sprint calendar
│   │   │   └── Profile.tsx         # User settings & security
│   │   ├── routes/                 # App routing & protected route guards
│   │   │   ├── AppRoutes.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── PublicRoute.tsx
│   │   │   └── SystemAdminRoute.tsx
│   │   ├── services/               # Centralized API Service Layer
│   │   │   ├── authService.ts      # Authentication API calls
│   │   │   ├── taskService.ts      # Task & analytics API calls
│   │   │   ├── backlogService.ts   # Backlog, Sprint, Epic API calls
│   │   │   ├── orgService.ts       # Organization & member API calls
│   │   │   └── notificationService.ts # Notification API calls
│   │   ├── store/                  # Redux Store & Slices
│   │   │   ├── index.ts            # Store configuration
│   │   │   └── slices/             # authSlice, taskSlice, sprintSlice, epicSlice
│   │   ├── types/                  # Centralized TypeScript interfaces
│   │   │   ├── user.ts, task.ts, agile.ts, organization.ts, components.ts
│   │   │   └── index.ts            # Barrel exports
│   │   └── utils/                  # Helper utilities (date formatters, text parsers)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.js
│   └── vercel.json                 # SPA route rewriting for Vercel
└── README.md                       # Project master documentation
```

---

## ⚙️ Core Services & Methods

PlanMate follows a strict **Centralized Service Layer Pattern**. Components and Redux thunks never make direct `axios` calls; they consume dedicated service modules:

### 1. `authService` (`src/services/authService.ts`)
- `login(credentials)`: Authenticates user credentials and returns JWT token & user profile.
- `register(userData)`: Registers a new user and joins/creates an organization.
- `getMe()`: Retrieves the current authenticated user's session data.
- `updateProfile(profileData)`: Updates user name, email, and display details.
- `changePassword(passwordData)`: Updates account security credentials.

### 2. `taskService` (`src/services/taskService.ts`)
- `getTasks(filters)`: Fetches tasks based on organization, sprint, or search filters.
- `getTaskById(taskId)`: Fetches complete details, subtasks, worklogs, links, and comments for a task.
- `createTask(taskData)`: Creates a new task or issue.
- `updateTask(taskId, updateData)`: Modifies task fields and generates an audit log entry.
- `deleteTask(taskId)`: Removes a task from the system.
- `addComment(taskId, commentText)`: Adds a comment with `@mention` parsing and sends user notifications.
- `deleteComment(taskId, commentId)`: Removes a comment from a task.
- `logWork(taskId, worklogData)`: Records time spent on a task.
- `linkTask(taskId, linkData)` / `unlinkTask(taskId, linkId)`: Manages task relationships.
- `getAnalytics()`: Fetches metrics for burndown charts, velocity, and workload distribution.

### 3. `backlogService` (`src/services/backlogService.ts`)
- `getBacklogData()`: Retrieves unassigned backlog tasks, active sprints, and epics.
- `createSprint(sprintData)` / `updateSprint(sprintId, sprintData)`: Sprint lifecycle management.
- `deleteSprint(sprintId)`: Deletes or soft-closes planned sprints.
- `createEpic(epicData)` / `updateEpic(epicId, epicData)` / `deleteEpic(epicId)`: Epic administration.

### 4. `orgService` (`src/services/orgService.ts`)
- `getOrgDetails()`: Fetches organization details, custom statuses, and member rosters.
- `getAllOrganizations()`: System admin retrieval of all platform tenants.
- `createOrganization(orgData)`: Onboards a new organization.
- `updateOrgStatus(statusData)`: Adds or modifies custom workflow statuses.
- `inviteMember(email, role)`: Invites new team members to the organization.
- `updateUserStatus(userId, status)`: Manages user account status (active/disabled).

### 5. `notificationService` (`src/services/notificationService.ts`)
- `getNotifications()`: Fetches unread and historical notifications for the current user.
- `markAsRead(notificationId)`: Marks a specific notification as read.
- `markAllAsRead()`: Bulk updates all unread notifications to read.

---

## 🔗 API Endpoints Reference

| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/user/login` | `POST` | User Login & Token generation |
| | `/api/user/register` | `POST` | Account registration |
| | `/api/user/me` | `GET` | Get active user session |
| | `/api/user/profile` | `PUT` | Update profile details |
| | `/api/user/password` | `PUT` | Change account password |
| **Organization**| `/api/organization` | `GET` | Get current user's organization |
| | `/api/organization/members` | `GET` | Get organization team members |
| | `/api/organization/statuses` | `POST / DELETE` | Add or delete custom workflow statuses |
| | `/api/organization/all` | `GET` | List all organizations (System Admin) |
| **Sprints** | `/api/sprints` | `GET / POST` | List sprints / Create new sprint |
| | `/api/sprints/:id` | `GET / PUT / DELETE` | Sprint detail, start/complete/soft-close sprint |
| **Epics** | `/api/epics` | `GET / POST` | List epics / Create new epic |
| | `/api/epics/:id` | `GET / PUT / DELETE` | Epic detail & update |
| **Tasks** | `/api/tasks/gp` | `GET / POST` | List workspace tasks / Create task |
| | `/api/tasks/:id/gp` | `GET / PUT / DELETE` | Fetch, update, or remove task |
| | `/api/tasks/gp/analytics` | `GET` | Retrieve burndown & velocity analytics |
| | `/api/tasks/:id/comments` | `POST / DELETE` | Add or delete task comments |
| | `/api/tasks/:id/worklogs` | `POST` | Log time spent on task |
| | `/api/tasks/:id/links` | `POST / DELETE` | Link or unlink task dependencies |
| **Notifications**| `/api/notifications` | `GET` | Fetch user notifications |
| | `/api/notifications/read-all` | `PUT` | Mark all notifications as read |
| | `/api/notifications/:id/read` | `PUT` | Mark single notification as read |

---

## 📐 Coding Standards & Architectural Best Practices

To maintain high software quality across the codebase, developers must adhere to the following standards:

### 1. Centralized API Route Mappings
- **Rule**: Never hardcode API URL strings directly in components, services, or Redux slices.
- **Practice**: All endpoints are referenced via `API_ROUTES` in `src/constants/routes.ts`.

### 2. Centralized Service Layer
- **Rule**: Components and Redux thunks must never make direct `axios` or `fetch` calls.
- **Practice**: Business logic and HTTP requests are encapsulated inside dedicated service modules (`src/services/`).

### 3. Strict Component File Size (< 250 Lines)
- **Rule**: No single React component or view file should exceed 250 lines of code.
- **Practice**: Decompose complex views into subcomponents and custom hooks (`hooks/`).

### 4. Centralized UI Texts & Messages
- **Rule**: Avoid raw user-facing strings, toast alerts, or console error messages in UI components.
- **Practice**: Store notification strings in `messages.ts` (`TOAST_MESSAGES`, `CONSOLE_ERRORS`) and UI labels in `uiTexts.ts`.

### 5. Unified Type Definitions
- **Rule**: Do not declare inline typings or ad-hoc interfaces inside files.
- **Practice**: Export interfaces from domain type files in `src/types/` (`user.ts`, `task.ts`, `agile.ts`, `organization.ts`).

### 6. Safe Agile State Transitions
- **Rule**: Sprints are soft-closed by updating their status to `"closed"` rather than permanently deleting database records.
- **Practice**: Completed tasks stay linked to the historical sprint for accurate burndown analytics, while incomplete tasks revert to the backlog.

---

## 🛠 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection URI

### 1. Environment Setup

#### Backend Environment Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/planmate
JWT_SECRET=your_jwt_secret_key_here
```

#### Frontend Environment Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:4000
```

---

### 2. Installation & Running Locally

#### Step A: Setup and Start Backend Server
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start development server with nodemon
npm start
```
The backend server will run on `http://localhost:4000`.

#### Step B: Setup and Start Frontend Application
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will run on `http://localhost:5173`.

---

## 🌐 Deployment

### Deploying to Vercel

PlanMate is pre-configured for seamless single-click deployment on [Vercel](https://vercel.com/):

- **Backend Deployment**: Configure `backend/vercel.json` to route `/api/*` requests to `server.js`.
- **Frontend Deployment**: Configure `frontend/vercel.json` with SPA rewrite rules to direct all routes to `index.html`.

---

## 📄 License

This project is maintained for production agile project management. All rights reserved.

