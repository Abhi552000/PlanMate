# PlanMate Frontend - Coding Standards & Guidelines

This project is built using React, TypeScript, and Vite. To maintain a clean, industry-standard, and modular codebase, please adhere to the following rules:

## Coding Standards

### 1. Component File Size Limit
* **Rule**: No React component or page view file should exceed **250 lines**. 
* **Practice**: If a file grows near this limit, immediately decompose it into smaller, focused subcomponents or extract the business logic into custom React hooks (e.g., inside a `hooks/` directory next to the pages).

### 2. Centralized Constants & Messages
* **Rule**: Never hardcode toast messages, user labels, help text, placeholders, or console error messages directly in component files.
* **Practice**: 
  - Add toast alerts and console logging strings to [messages.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/constants/messages.ts) (`TOAST_MESSAGES`, `CONSOLE_ERRORS`).
  - Add headers, buttons, form texts, and page layouts to [uiTexts.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/constants/uiTexts.ts) (`BACKLOG_TEXTS`, `ACTIVE_SPRINT_TEXTS`, `AUTH_TEXTS`).

### 3. Clean Effects (No Inline Async Functions in useEffect)
* **Rule**: Do not define asynchronous data-fetching functions directly inside a React `useEffect` callback block.
* **Practice**: Declare the fetching logic outside `useEffect` using `useCallback` or as a standard class method, then reference and execute it inside the `useEffect` block. This keeps hook dependencies clean and robust.

Example:
```typescript
const fetchOrgName = useCallback(async () => {
  try {
    const data = await orgService.getOrgDetails();
    if (data?.success && data?.organization) {
      setOrgName(data.organization.name);
    }
  } catch (err) {
    console.error(CONSOLE_ERRORS.FETCH_ORG_NAME, err);
  }
}, []);

useEffect(() => {
  fetchOrgName();
}, [fetchOrgName]);
```

### 4. Unified Types & Interfaces
* **Rule**: Do not declare inline typings or ad-hoc interfaces inside files.
* **Practice**: Keep types organized inside the `src/types/` directory. Export component-specific prop interfaces from [components.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/types/components.ts) and export them in [index.ts](file:///Users/abhisheksingh/Desktop/PlanMate/frontend/src/types/index.ts).
