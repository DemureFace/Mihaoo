Mihaoo Development Rules
Revision 2 - 2026-10-06. Project working rules, not a completion report.
Required context

- At the start of a Mihaoo work session, read CODEX_HANDOFF.md at the repository root, especially its status/provenance section and current checkpoint. Before responsive implementation or review, also read RESPONSIVE_TEST_MATRIX.md at the repository root. Implementation guidelines and reusable examples are in docs/responsive/GUIDELINES.md and docs/responsive/PATTERNS.md.
- Follow applicable repository and directory-level agent instructions. Do not assume an arbitrary handoff filename is automatically loaded; read the referenced documents explicitly.
- Answer the owner in Ukrainian. Preserve the current language of existing UI labels unless translation is requested.
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
- Work in meaningful, coherent batches. Do not stop for approval, a commit, or a push after each small edit. Continue within the approved scope; ask only about destructive actions, meaningful scope changes, or material ambiguity.
- Do not remove working behavior unless required.
- Prefer reusable patterns over page-specific hacks.
- Do not add dependencies unless there is a clear need.
- Do not commit or push unless explicitly requested.
- Do not expose secrets from .env files or credentials.
- Use current local files and diffs as evidence of what exists, not as authority for what the product should do. Preserve local changes, follow the owner's latest explicit requirements, and flag meaningful conflicts with the handoff; do not silently revert code or reinterpret requirements.
- When an API contract is still draft, do not invent a backend response shape silently.
  Local safety and scope
- First inspect the repository root, current branch, git status --short, and relevant unstaged/staged diffs. A dirty working tree is not permission to discard changes or a reason to require an immediate push.
- Do not run destructive reset/clean/restore commands, switch branches, rewrite history, stage unrelated files, or overwrite the owner's edits without explicit approval. Never use git reset --hard, git clean -fd, or force-push as routine cleanup.
- Do not run database migrations/imports, change Render/Netlify settings, deploy, or make production write requests during responsive work.
- No dependency upgrades, lockfile rewrites, npm audit fix --force, or new libraries as incidental cleanup. Inspect existing Node/package-manager configuration before setup; ask when an install or change is actually needed.
- Preserve exact filename/import casing, including SideBar.vue and TheHeader.vue. Do not hardcode a Mac/Windows home directory or reformat the entire repository merely to normalize line endings.
- Never print environment secrets, auth tokens, cookies, or full credential-bearing URLs. Redact diagnostics; report an exposure privately to the owner without copying the secret.
- Keep the existing permission/sandbox settings. Request only the specific access required; do not disable protections for convenience.
  Verification
  After a logical batch is complete, use the installed project tools:
  npm run format
  npx eslint .
  npm run build
  Important:
- npm run lint executes eslint . --fix and mutates files.
- Use npx eslint . when a check-only lint run is desired.
- Inspect package.json first: these commands describe the previous snapshot, not a guarantee about a newer checkout.
- npm run format formats all of src/ in the recorded snapshot. Review its diff; use the project's existing formatter on touched files instead when a global run would change unrelated work, and report that choice.
- Record actual command outcomes. Distinguish pre-existing failures, introduced failures, unavailable tools, and checks not run. Lint/build success alone does not mean responsive behavior or backend integration was tested.
- Use the responsive test matrix for browser evidence. Isolated fixtures must be labeled as fixtures, must not silently replace API failures, and must not trigger production writes.
- If browser access or a backend is unavailable, continue safe code work and report the unverified scenarios explicitly. Never manufacture screenshots, passing checks, or deployment claims.
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
   Use these as CSS viewport test sizes; record device pixel ratio (DPR), zoom, browser and actual device separately. At minimum verify:

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
  Inspect the existing Tailwind theme/breakpoints before implementation. Prefer the existing standard breakpoint system; a 4K test does not by itself require a new breakpoint.
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
  Responsive regression rules
- Do not change API routes, DTOs, SP/performance formulas, auth rules, or generated CMS output as a side effect of responsive styling. Keep unfinished API flags off.
- Keep all existing controls and data available on small screens; use accessible navigation, wrapping and contained scrolling rather than removing functionality to make a screenshot fit.
- Do not fix overflow by blanket html/body { overflow-x: hidden }. Correct width/min-width/flex/grid containment and document intentional local clipping.
- Mobile modal/drawer behavior must include accessible naming, keyboard operation, topmost Escape handling, focus management and a shared scroll-lock lifecycle. Hidden off-canvas controls must not remain keyboard-focusable.
- Preserve desktop navigation, route behavior, form values and copy/export/download actions. Account for Vue KeepAlive activation/deactivation where present.
- Treat the suggested 1920px content cap as a design starting point. Dense tables and Maps/canvas may need an explicit wide mode; do not squeeze every module into the same reading width.
  Batch completion and continuity
- Before finishing, review the final diff for unrelated changes and update the handoff's current checkpoint: completed, locally verified, pending and blocked are separate states.
- Report changed files, implemented behavior, actual checks and results, remaining risks, and one concrete next batch. Do not claim a repository push, production deployment or Confluence publication unless performed and confirmed.
- Keep permanent rules here and detailed context/evidence in docs/; do not keep appending the whole conversation to AGENTS.md.
