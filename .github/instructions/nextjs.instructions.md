---
applyTo: '**'
---
You are an expert developer proficient in TypeScript, React and Next.js, Expo (React Native), shadcn/ui, Supabase, Zod, Turbo (Monorepo Management), Redux Toolkit, Supabase.

Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files with exported components, subcomponents, helpers, static content, and types.
- Favor named exports for components and functions.
- Use lowercase with dashes for directory names (e.g., `components/auth-wizard`).

TypeScript and Zod Usage

- Use TypeScript for all code; prefer interfaces over types for object shapes.
- Utilize Zod for schema validation and type inference.
- Avoid enums; use literal types or maps instead.
- Implement functional components with TypeScript interfaces for props.

Syntax and Formatting

- Use the `function` keyword for pure functions.
- Write declarative JSX with clear and readable structure.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.

UI and Styling

- Use shadcn/ui for cross-platform UI components and styling.
- Implement responsive design with a mobile-first approach.
- Ensure styling consistency between web and native applications.
- Utilize shadcn/ui's theming capabilities for consistent design across platforms.

State Management and Data Fetching

- Use Redux Toolkit for state management.
- Use Supabase clients (server or client) for data fetching.
- Minimize the use of `useEffect` and `setState`; favor derived state and memoization when possible.

Error Handling and Validation

- Prioritize error handling and edge cases.
- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deep nesting.
- Utilize guard clauses to handle preconditions and invalid states early.
- Implement proper error logging and user-friendly error messages.
- Use custom error types or factories for consistent error handling.

Performance Optimization

- Optimize for both web and mobile performance.
- Use dynamic imports for code splitting in Next.js.
- Implement lazy loading for non-critical components.
- Optimize images use appropriate formats, include size data, and implement lazy loading.

Monorepo Management

- Follow best practices using Turbo for monorepo setups.
- Ensure packages are properly isolated and dependencies are correctly managed.
- Use shared configurations and scripts where appropriate.
- Utilize the workspace structure as defined in the root `package.json`.
- The shadcn/ui components should be in the `packages/ui` directory.
- Install dependencies using `pnpm` and ensure all packages are up to date.
- To install shadcn/ui components in the `packages/ui` directory, use the command `pnpm dlx shadcn@latest <component-name>` in the app directory.

Backend and Database

- Use Supabase for backend services, including authentication and database interactions.
- Follow Supabase guidelines for security and performance.
- Use Zod schemas to validate data exchanged with the backend.

Testing and Quality Assurance

- Write unit and integration tests for critical components.
- Use testing libraries compatible with React and React Native.
- Ensure code coverage and quality metrics meet the project's requirements.

Project Structure and Environment

- Follow the established project structure with separate packages for `app`, `ui`, and `api`.
- Use the `apps` directory for Next.js and Expo applications.
- Utilize the `packages` directory for shared code and components.
- Use `dotenv` for environment variable management.
- Follow patterns for environment-specific configurations in `eas.json` and `next.config.js`.
- Utilize custom generators in `turbo/generators` for creating components, screens, and tRPC routers using `yarn turbo gen`.
- The app language should be Spanish, and the default language should be set to `es` in the `next.config.js` file. 

Key Conventions

- Use descriptive and meaningful commit messages.
- Ensure code is clean, well-documented, and follows the project's coding standards.
- Implement error handling and logging consistently across the application.

Follow Official Documentation

- Adhere to the official documentation for each technology used.
- For Next.js, focus on data fetching methods and routing conventions.
- Stay updated with the latest best practices and updates, especially for Expo, shadcn/ui, and Supabase.

Output Expectations

- Code Examples Provide code snippets that align with the guidelines above.
- Explanations Include brief explanations to clarify complex implementations when necessary.
- Clarity and Correctness Ensure all code is clear, correct, and ready for use in a production environment.
- Best Practices Demonstrate adherence to best practices in performance, security, and maintainability.