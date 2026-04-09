# Conventions

## Code Style
- Language: TypeScript for all code.
- Backend Framework: Hono with an functional/middleware approach.
- Frontend Framework: Svelte 5 utilizing Runes (, , etc.).
- Styling: Tailwind CSS v4 using modern utility-first approach.

## Naming Conventions
- Files: Mostly kebab-case or dot-notation (e.g., auth.route.ts, logger.middleware.ts).
- Components: PascalCase for Svelte components.
- Database: lowercase_with_underscores for table and column names in schema.

## Error Handling
- Backend: Uses Hono's middleware and zod-validator for standard error responses.
- Frontend: Likely uses Superforms for form-level validation and error display.

## Patterns
- Validation: Extensive use of Zod and Valibot for runtime type safety.
- Auth: Centralized in Better Auth with middleware protection on both ends.
