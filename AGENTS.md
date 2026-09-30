<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Project Structure
kasbon/
├── src/
│   ├── app/                      # Next.js Routing Layer (Pages, Layouts, Route Handlers)
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Server Component (Data Assembly)
│   │   │   └── actions.ts       # Controller Equivalent (Server Actions)
│   │   └── api/                  # Explicit HTTP routes (webhooks, external consumption)
│   │
│   ├── modules/                  # Domain / Feature Slices (Service & Repo Layer)
│   │   └── users/
│   │       ├── user.types.ts     # Domain Entities / Models
│   │       ├── user.repository.ts# Repository: Direct DB Access (Drizzle/Prisma)
│   │       ├── user.service.ts   # Service: Business Logic & Rules
│   │       └── user.schema.ts    # Input Validation (Zod)
│   │
│   └── components/               # Shared / Reusable UI Components
│       ├── ui/                   # Primitive UI components (Button, Input)
│       └── forms/                # Client Components ("use client")

# API Response Schema

- Every endpoint response must use the envelope `{"Message": string, "Data": T}` — `Message` is a human-readable string, `Data` holds the payload of any type (object, list, null, etc.).

# Git workflow

- Start every task on a new branch (name it after the task file, e.g. `frontend-task-1`); never commit directly to `main`.
- Immediately after creating the branch, run `git pull origin main` so it starts from the latest main.
- If a task has multiple subtasks, make one commit per subtask with a clear message describing that subtask, commit message should contain this format `(feat/fix)task-1:EXPLAIN THE CHANGES IN DETAIL`, and push all commits to `origin`.

# Control Flow

- Repositories contain interface and its implementation. Its function is for data access
- Services contain business logic and business validation. Services can depend on other service. Service should only depend on repository interface, not the implementation
- Controllers (action.ts) should only accept user input, early user input validation (check if input is string, check input length, anything that is not business related), and return

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.opencode/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.opencode/skills/antislop-ui/SKILL.md`
- Code comments: `antislop-code`: `.opencode/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
