# PlanMate - Agile Project Management

PlanMate is an industry-level Agile Scrum management dashboard designed to organize, plan, and execute sprints, backlogs, epics, and tasks.

---

## Coding Standards & Best Practices

To maintain a professional, industry-standard codebase, all developers (and AI assistants) must strictly adhere to the following rules:

### 1. Centralized API Routes
* **Rule**: Never use direct or hardcoded API URL strings (e.g. `"/api/sprints"`, `"/api/epics"`) inside Redux slices, components, or hooks.
* **Practice**: Add all endpoints to the `API_ROUTES` constant in [routes.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/constants/routes.ts). Reference them throughout the app via `API_ROUTES.SUB_LAYER.ROUTE_KEY`.

### 2. Centralized Service Layer
* **Rule**: Do not perform direct HTTP requests (`axios` calls) inside components or Redux thunks.
* **Practice**: Define business logic functions inside their corresponding service files under [services/](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/services/) (e.g. `backlogService`, `taskService`, `orgService`). Redux thunks and components should only fetch data by calling these service layer functions.

### 3. Unified Types & Interfaces
* **Rule**: Do not declare inline typings or ad-hoc interfaces inside files.
* **Practice**: Keep types organized inside [types/](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/types/) directory. Export new interfaces from their specific domain type files (e.g. `agile.ts`, `task.ts`, `user.ts`) and export them in [index.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/types/index.ts).

### 4. Safe State Transitions (No Database Deletions)
* **Rule**: Do not permanently delete historical agile records (like Sprints) from the database.
* **Practice**: Sprints are soft-closed by changing their status to `"closed"`. Incomplete tasks return to the backlog, while completed ones stay in the closed sprint to preserve historical record integrity.

### 5. Centralized Console Messages & Labels
* **Rule**: Never write direct raw strings for console errors, alerts, or user toast notifications.
* **Practice**: Always add string templates or messages to [messages.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/constants/messages.ts) (`TOAST_MESSAGES`, `CONSOLE_ERRORS`) and reference them.

### 6. Clean Effects (No Inline Async Functions in useEffect)
* **Rule**: Do not define async data-fetching functions directly inside a React `useEffect` callback block.
* **Practice**: Declare the fetching logic outside `useEffect` using `useCallback` or as a standard class method, then reference and execute it inside the `useEffect` block. This keeps hook dependencies clean and robust.
