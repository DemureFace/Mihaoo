Mihaoo Development Rules
Scope
This repository is the Mihaoo frontend.
Frontend repository:

- DemureFace/Mihaoo
  Backend repository:
- DemureFace/BackendMihaoo
  Do not modify backend implementation from frontend work.
  If a backend change is required:
- describe it as a small Jira-style task;
- include context, scope and acceptance criteria;
- do not write backend implementation code unless the project owner explicitly changes this rule.
  Frontend stack
- Vue 3
- Composition API
- <script setup>
- JavaScript only
- Vite
- Tailwind CSS v4
- Vue Router
- Vuex
- Axios
- Heroicons
- Vue Flow for Maps
  Prefer existing Base components over ad-hoc controls:
- BaseButton
- BaseInput
- BaseSelect
- BaseTextarea
- BaseModal
- BaseCheckbox
- BaseLoader
  Working style
- Inspect the current implementation before changing a file.
- Prefer small logical batches over one huge rewrite.
- Do not remove working behavior unless required.
- Prefer reusable patterns over page-specific hacks.
- Do not add dependencies unless there is a clear need.
- Do not commit or push unless explicitly requested.
- Do not expose secrets from .env files or credentials.
- If repository code conflicts with documentation, prefer the current repository state and report the difference.
- When an API contract is still draft, do not invent a backend response shape silently.
  Verification
  After a logical batch is complete, use:
  npm run format
  npx eslint .
  npm run build
  Important:
- npm run lint executes eslint . --fix and mutates files.
- Use npx eslint . when a check-only lint run is desired.
  Current priority
  The active priority is a reusable responsive/adaptive frontend model for Mihaoo.
  Order:

1. Global layout
2. Base components
3. Analytics
4. Tournaments / Promo
5. Checklists
6. Banner Export
7. Maps
8. Remaining pages
   Do not add new Analytics product features while the responsive work is in progress unless explicitly requested.
   Responsive target matrix
   At minimum verify:

- 320 x 568
- 375 x 667
- 390 x 844
- 768 x 1024
- 1024 x 768
- 1280 x 800
- 1440 x 900
- 1920 x 1080
- 2560 x 1440
- 3840 x 2160
  Use Tailwind's standard breakpoints unless a real product requirement requires a custom breakpoint.
  Responsive principles
- Mobile-first.
- No uncontrolled page-level horizontal overflow.
- Tables may use contained horizontal scrolling instead of being compressed.
- Mobile navigation should use a drawer/overlay pattern.
- Modals should become near-fullscreen/fullscreen-like on small screens.
- Large/4K screens should not stretch core content indefinitely; use a reasonable max content width.
- Forms must remain usable without zooming.
- Sticky UI must not consume most of the viewport on small screens.
- Touch devices should not depend on hover behavior.
