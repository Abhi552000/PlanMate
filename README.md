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
- [Security & Data Protection](#-security--data-protection)
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
                                  (JWT Bearer Authenticated)
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
- **Collapsible Sprints & Backlog**: Clean, collapsed-by-default view for compact backlog planning.

### 2. 📋 Interactive Kanban Board with Zero "No Data" Flash
- **Multi-Column Status Pipeline**: Configurable columns (`To Do`, `In Progress`, `In Review`, `Done`, and custom organization statuses).
- **Anti-Flash Loading Architecture**: Smooth pulse skeleton cards display inside columns while data is fetching; empty state placeholders only render after API confirmation.
- **Interactive Board Filters**: Real-time filtering by assignee, priority (`High`, `Medium`, `Low`), Epic, and keyword search.

### 3. 📝 Comprehensive Task Lifecycle & Subtask System
- **Issue Types**: Support for `Story`, `Task`, `Bug`, and `Epic`.
- **Estimation & Work Logs**: Original estimation, time logged, remaining estimate, and detailed work logs.
- **Interactive Subtasks**: Subtask creation, status toggles, and detail view drills.
- **Task Dependencies & Linking**: Link tasks with relationships (`blocks`, `blocked by`, `relates to`).
- **Audit History / Activity Timeline**: Automatic tracking of field modifications (status, priority, assignee, story points) with user attribution.
- **Rich Comments with `@mentions`**: Interactive task comments with user mention suggestions and notification triggers.

### 4. 📅 Interactive Calendar View
- Visual month grid displaying task due dates, sprint deadlines, and delivery milestones.
- Side panels for selected day tasks and unscheduled task inbox with smooth skeleton loaders.

### 5. 📊 Analytics & Burndown Dashboard
- **Sprint Burndown Charts**: Visual comparison of ideal vs. actual remaining story points/work.
- **Velocity Tracking**: Sprint-over-sprint completion velocity metrics.
- **Workload Distribution**: Visual distribution breakdown by assignee and task priority using **Recharts**.
- **Epic Progress Visualization**: Percentage completion tracking per Epic.

### 6. 📈 Executive Reports & Delivery Insights
- **KPI Summary Cards**: Total work items, completed issues, average lead time, and cycle time.
- **Donut Breakdowns**: Interactive breakdown by Status, Issue Type, and Assignee.
- **Delivery Trends**: Completion throughput, issue creation trends, and lead time vs. cycle time comparison.
- **Drilldown Work Item Table**: Searchable, filterable work items table with CSV export and slide-over task inspector drawer.

### 7. 💳 Multi-Tier Subscription, Plans & Billing Engine
- **Flexible Plans**: Starter, Growth, and Scale plans with monthly/yearly billing toggle (including 20% annual discount).
- **Seat Limit Enforcer**: Real-time quota validation preventing over-allocation of organization members.
- **Simulated Checkout & Payment Modal**: Seamless subscription activation with transaction generation.
- **Invoice & Billing History**: Complete payment records and invoice tracking.

### 8. 🛡️ System Administration (Super Admin Platform Portal)
- **Tenant Management**: Global directory of all platform organizations with activation, deactivation, and editing capabilities.
- **System-Wide Billing Audit**: Consolidated revenue statistics and transaction logs across all tenants.
- **Plan Catalog Editor**: Create, update, or remove subscription tiers directly from the UI.

### 9. 🏢 Multi-Tenant Organization & Role-Based Access Control (RBAC)
- **Role Hierarchy**: System Administrator (`system_admin`), Organization Administrator (`org-admin`), and Member (`member`).
- **Custom Workflows**: Define and manage custom task statuses per organization.
- **Member Onboarding**: Organization signup, member invitation, user activation/deactivation.

### 10. 🎨 Unified Design System & UX Standards
- **Standardized UI Primitives**: Reusable `Button`, `Input`, `Select`, `FilterSelect`, `SearchInput`, `Pagination`, `TableCard`, and `Table` components across every page.
- **Smart Windowed Pagination**: Ellipsis windowing (`1, 2, 3 ... 10`) consistent throughout user, org admin, and super admin tables.
- **Mobile-Optimized Toast Alerts**: Compact, non-intrusive notification cards styled with PlanMate theme accents.
- **Centralized Constants**: 100% centralized strings and error messages (`uiTexts.ts`, `messages.ts`, `billingTexts.ts`, `routes.ts`).
- **Jira Keyboard Shortcut**: Press `[` to toggle the collapsible navigation sidebar.

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
- `getSubscription()`: Fetches current subscription plan and seat usage metrics.
- `subscribeToPlan(planId, billingCycle)`: Simulates plan activation and payment processing.
- `getBillingHistory()`: Fetches invoices and transaction history.
- `getAllPaymentsForAdmin(params)`: System admin platform-wide transaction auditor.

### 5. `planService` (`src/services/planService.ts`)
- `getActivePlans()`: Retrieves active subscription tiers for organization workspace upgrades.
- `getAllPlansForAdmin()`: Super admin retrieval of the complete plan catalog.
- `createPlan(planData)` / `updatePlan(planId, planData)` / `deletePlan(planId)`: Admin management of pricing, features, and quotas.

### 6. `notificationService` (`src/services/notificationService.ts`)
- `getNotifications()`: Fetches unread and historical notifications for the current user.
- `markAsRead(notificationId)`: Marks a specific notification as read.
- `markAllAsRead()`: Bulk updates all unread notifications to read.

---

## 🔗 API Endpoints Reference

All non-public endpoints require an `Authorization: Bearer <token>` header verified by backend middleware.

| Module | Endpoint | Method | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/user/login` | `POST` | Public | User Login & JWT token issuance |
| | `/api/user/register` | `POST` | Public | Account registration & organization association |
| | `/api/user/me` | `GET` | Authenticated | Retrieve active user session profile |
| | `/api/user/profile` | `PUT` | Authenticated | Update user display profile |
| | `/api/user/password` | `PUT` | Authenticated | Update account password |
| **Organization**| `/api/organization` | `GET / PUT` | Authenticated | Get or update current user's organization profile |
| | `/api/organization/members` | `GET` | Authenticated | List organization team members |
| | `/api/organization/public-list`| `GET` | Public | Public organization list for registration dropdown |
| | `/api/organization/statuses` | `POST / DELETE` | Org Admin | Add or delete custom workflow statuses |
| | `/api/organization/all` | `GET` | Super Admin | List all tenant organizations |
| | `/api/organization/:id/status` | `PUT` | Super Admin | Activate or deactivate organization instance |
| | `/api/organization/onboard` | `POST` | Super Admin | Direct onboarding of a new organization instance |
| **Billing & Plans** | `/api/plans` | `GET` | Authenticated | List available active subscription tiers |
| | `/api/plans/admin/all` | `GET` | Super Admin | Retrieve all platform plans |
| | `/api/plans` | `POST / PUT / DELETE` | Super Admin | Create, edit, or delete platform plans |
| | `/api/organization/subscription` | `GET` | Org Admin | Fetch active subscription tier & seat quotas |
| | `/api/organization/subscribe` | `POST` | Org Admin | Activate or upgrade subscription tier |
| | `/api/organization/billing-history`| `GET` | Org Admin | Retrieve organization invoice history |
| | `/api/organization/admin/payments` | `GET` | Super Admin | Platform-wide payment records audit |
| **Sprints** | `/api/sprints` | `GET / POST` | Authenticated | List sprints / Create new sprint |
| | `/api/sprints/:id` | `GET / PUT / DELETE` | Authenticated | Sprint details, start, complete, or soft-close |
| **Epics** | `/api/epics` | `GET / POST` | Authenticated | List epics / Create new epic |
| | `/api/epics/:id` | `GET / PUT / DELETE` | Authenticated | Epic details, update, or remove |
| **Tasks** | `/api/tasks/gp` | `GET / POST` | Authenticated | List workspace tasks / Create new issue |
| | `/api/tasks/:id/gp` | `GET / PUT / DELETE` | Authenticated | Fetch, update, or remove task |
| | `/api/tasks/gp/analytics` | `GET` | Authenticated | Burndown, velocity, and workload metrics |
| | `/api/tasks/:id/comments` | `POST / DELETE` | Authenticated | Comment management with `@mention` triggers |
| | `/api/tasks/:id/worklogs` | `POST` | Authenticated | Log time worked against estimates |
| | `/api/tasks/:id/links` | `POST / DELETE` | Authenticated | Link or unlink task dependencies |
| **Notifications**| `/api/notifications` | `GET` | Authenticated | Fetch user notifications |
| | `/api/notifications/read-all` | `PUT` | Authenticated | Mark all notifications as read |
| | `/api/notifications/:id/read` | `PUT` | Authenticated | Mark single notification as read |

---

## 🔒 Security & Data Protection

PlanMate implements industry-standard defense-in-depth security across the full stack:

1. **Strict JWT Bearer Authentication**: 
   - All private routes enforce `authMiddleware`. Requests without a valid, cryptographically signed JSON Web Token are immediately rejected with `401 Unauthorized`.
2. **Tenant Isolation (Multi-Tenancy Guard)**:
   - Data is strictly partitioned by Organization ID. The backend verifies that `req.user.organization` matches the target resources, preventing users from ever querying or modifying data belonging to another tenant.
3. **Role-Based Access Control (RBAC)**:
   - Administrative endpoints (e.g., plan creation, tenant suspension, custom status deletion) enforce explicit role checks (`org-admin` or `system_admin`). Standard members cannot execute privileged operations.
4. **Password Security**:
   - User passwords are automatically salted and hashed using **Bcrypt** before saving to MongoDB. Plaintext passwords never touch logs or databases.
5. **No Secrets in Version Control**:
   - Database credentials, JWT secrets, port numbers, and payment keys are strictly kept in ignored `.env` files. Documentation only provides generic placeholders (`<username>`, `<password>`).
6. **Input Sanitization & Validation**:
   - Request bodies are validated using `validator` and Mongoose schema constraints to guard against injection attacks.

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

