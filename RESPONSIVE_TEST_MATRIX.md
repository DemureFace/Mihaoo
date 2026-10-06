# Mihaoo Responsive Test Matrix

_Revision 2 companion - 2026-10-06. Proposed acceptance plan and blank evidence log._

**No application checks were executed while creating this template. All listed tests start as NOT RUN.**
Read alongside `AGENTS.md` and `CODEX_HANDOFF.md`. This adds verification detail to the responsive OKR; it does not change the product scope or authorize production writes.

## 1. Evidence rules

Use only these statuses: `NOT RUN`, `PASS`, `FAIL`, `BLOCKED`.

- PASS requires an actually executed check and an observable result.
- A failing prerequisite is BLOCKED for downstream checks, not PASS.
- Record code revision plus the relevant uncommitted-diff state: a commit alone does not describe a dirty local tree.
- Record browser/version, OS, viewport width/height, device pixel ratio (DPR), browser zoom, and real-device vs emulation.
- Mark the data source: `real test API`, `isolated fixture`, or `UI without API`.
- Do not include tokens, credentials, private task descriptions or unredacted personal information in shared evidence.
- Add screenshot/log paths only after files actually exist. Keep screenshots outside AGENTS.md.

## 2. Viewport matrix

All dimensions below are **CSS viewport sizes**, not inferred physical display resolution.
A physical 4K/Retina/scaled monitor may expose a smaller CSS viewport. Test wide layout and high-DPR rendering separately. Record observed viewport/DPR/zoom on the actual Mac; do not derive them solely from a monitor label.

| Case | CSS viewport                                | Intended coverage                                             | Status  |
| ---- | ------------------------------------------- | ------------------------------------------------------------- | ------- |
| V01  | 320 x 568                                   | Narrow phone layout                                           | NOT RUN |
| V02  | 375 x 667                                   | Small phone layout                                            | NOT RUN |
| V03  | 390 x 844                                   | Modern phone layout                                           | NOT RUN |
| V04  | 768 x 1024                                  | Tablet / navigation boundary                                  | NOT RUN |
| V05  | 1024 x 768                                  | Tablet landscape / compact desktop                            | NOT RUN |
| V06  | 1280 x 800                                  | Laptop                                                        | NOT RUN |
| V07  | 1440 x 900                                  | Desktop baseline                                              | NOT RUN |
| V08  | 1920 x 1080                                 | Full HD-sized viewport                                        | NOT RUN |
| V09  | 2560 x 1440                                 | Wide/QHD-sized viewport                                       | NOT RUN |
| V10  | 3840 x 2160                                 | 4K-wide CSS viewport                                          | NOT RUN |
| V11  | 767/768/769px widths, height 900            | CSS/JS navigation boundary agreement                          | NOT RUN |
| V12  | Actual viewport, DPR 2 where available      | Retina/scaled display behavior                                | NOT RUN |
| V13  | 1440 x 900 baseline, then 200% browser zoom | Reflow and accessible controls; record resulting CSS viewport | NOT RUN |
| V14  | 844 x 390                                   | Narrow landscape / limited vertical space                     | NOT RUN |

Also test immediately below/at/above other breakpoints actually used in the changed components. If the repository uses a different navigation boundary, update V11 to that boundary and record why.

Browser plan: Chromium and Safari on the owner's Mac where available. If only a browser engine/emulator is available, name it accurately and keep unavailable real-device checks BLOCKED/NOT RUN. No claim of complete browser certification follows from this plan.

## 3. Route coverage

Inspect current router names/casing before using these recorded paths. Run safe visual/interaction checks on changed modules, with narrow and desktop regression checks after shared changes.

| Module                                  | Recorded route                            | Batch                       | Status  |
| --------------------------------------- | ----------------------------------------- | --------------------------- | ------- |
| Global shell / header / navigation      | Across all accessible routes              | 1                           | NOT RUN |
| Analytics Task List                     | /analytics/tasks                          | 1-2                         | NOT RUN |
| Analytics Report and weekly-report form | /analytics/report                         | 1-2                         | NOT RUN |
| Tournament generator                    | /tournaments                              | 3 / second reusable example | NOT RUN |
| Promo generator                         | /promo                                    | 3                           | NOT RUN |
| Checklists                              | /checklists and an existing detail route  | 4                           | NOT RUN |
| Banner Export                           | /banner-export                            | 4                           | NOT RUN |
| Maps                                    | /maps and an accessible view/editor route | 5                           | NOT RUN |
| Dashboard / home                        | /dashboard, /home                         | Regression / later pages    | NOT RUN |
| News / calendar / currency converter    | Verify current routes                     | Later pages                 | NOT RUN |

Protected routes may require an approved test account. Do not count a login redirect as testing the protected page. A fixture-based UI pass is not a backend integration pass.

## 4. Acceptance scenarios

### Shared shell

| ID  | Action / state                                                       | Expected result                                                                               | Status  |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------- |
| S01 | Open each changed route at V01, V03 and V07                          | Header and main controls visible; no unintended document horizontal overflow                  | NOT RUN |
| S02 | Inspect a dense table or long generated code                         | Overflow stays in the local table/code container; all content remains reachable               | NOT RUN |
| S03 | Resize V11 with drawer open and with sidebar collapsed               | One correct navigation mode; no stale backdrop, lock or width offset                          | NOT RUN |
| S04 | Open mobile navigation, navigate, select current route, press Escape | Dismissal works; appropriate focus recovery; no hidden focusable links                        | NOT RUN |
| S05 | Tab/Shift+Tab with modal navigation open                             | Focus stays within active modal surface; underlying page not interactive                      | NOT RUN |
| S06 | V09 and V10, normal page and Maps                                    | Readable controls, sensible width policy; canvas uses intentional space without page overflow | NOT RUN |
| S07 | Zoom / limited height / reduced motion                               | Controls remain reachable; nonessential motion respects preference                            | NOT RUN |

### Modals and forms

| ID  | Action / state                                              | Expected result                                                                                    | Status  |
| --- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| M01 | Open a long form at V01 and V14                             | Content scrolls; close and submit actions remain reachable                                         | NOT RUN |
| M02 | Open and close using keyboard                               | Named dialog, sensible initial focus and focus restoration                                         | NOT RUN |
| M03 | Drawer and modal / two modal owners                         | Escape affects topmost dismissible surface only; scroll lock released only after last owner closes | NOT RUN |
| M04 | Type long text, URL, email, labels and validation errors    | Wrapping/containment works; no clipped essential content                                           | NOT RUN |
| M05 | Focus fields with an on-screen keyboard where available     | Active field/actions reachable; record real-device or emulated coverage                            | NOT RUN |
| M06 | Resize with unsaved form input                              | Values are preserved; no duplicate initialization erases input                                     | NOT RUN |
| M07 | Loading, failed save and retry using safe fixtures/test API | Input retained; duplicate submit prevented; no false success or hidden error                       | NOT RUN |

### Analytics and regression

| ID  | Action / state                                          | Expected result                                                                                            | Status  |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| A01 | Wrap presets, Reset/Apply, filter grid                  | Usable controls at narrow widths; non-sticky filters do not obstruct the page                              | NOT RUN |
| A02 | Table scroll with real-looking long fixture rows        | Header/body alignment and readable cells; keyboard actions remain available                                | NOT RUN |
| A03 | Loading / empty / error / API disabled states           | Distinct and mutually exclusive messaging; errors are not zero results                                     | NOT RUN |
| A04 | Weekly form create-preview-edit with safe data          | State preserved; local preview not labelled DB-saved; legacy/zero metric checks kept separate from styling | NOT RUN |
| A05 | Open A then B / close during request                    | Stale response cannot replace the latest view; no orphaned loading state                                   | NOT RUN |
| A06 | Navigate away/back with KeepAlive where used            | No stale overlays/locks/listeners; expected state and request lifecycle                                    | NOT RUN |
| A07 | Copy/export/download and navigation regression          | Existing behavior unchanged; never trigger production generation/write merely for responsive testing       | NOT RUN |
| A08 | Apply shared patterns in Tournament/Promo or Checklists | Second structurally different module works without copied layout hacks                                     | NOT RUN |

Document-overflow aid (run in the browser, not as proof by itself): compare `document.documentElement.scrollWidth` with `document.documentElement.clientWidth`, allowing a 1px rounding tolerance. Visually inspect clipped content and local scrollers as well; hidden overflow can otherwise conceal a defect.

## 5. Record actual results here

| Date / tester | Code revision + diff state | Route / scenario | CSS viewport / DPR / zoom | Browser / OS / real vs emulated | Data source  | Status  | Evidence / defect   |
| ------------- | -------------------------- | ---------------- | ------------------------- | ------------------------------- | ------------ | ------- | ------------------- |
| Not executed  | Not inspected              | No results yet   | Not recorded              | Not recorded                    | Not recorded | NOT RUN | No evidence created |

## 6. Batch verification log template

```text
Batch name and scope:
Baseline branch/commit and pre-existing edits:
Changed files:
Formatting command, scope and actual result:
Lint command and actual result:
Build command and actual result:
Browser scenarios actually executed:
Screenshots/logs actually created:
Existing failures:
New failures:
Checks not run and reason:
Remaining blockers:
Next batch:
Commit/push/deploy: not performed unless explicitly authorized
```

Do not mark the responsive OKR complete until the implementation is tested, a second module demonstrates reuse, and the documented Confluence publication has been confirmed. If backend work remains blocked, report the responsive UI evidence independently rather than declaring full feature integration complete.

## 7. Technical reference basis

These sources explain the additional verification concepts, not Mihaoo's current behavior:

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
- W3C modal interaction pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
