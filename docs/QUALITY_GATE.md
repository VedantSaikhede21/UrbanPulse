# Definition of Done — Quality Gate

> A component or feature is not complete until ALL of these pass.

---

## Component Checklist

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | ✅ Renders on **mobile** (375px viewport) | Resize browser / devtools |
| 2 | ✅ Renders on **desktop** (1280px+) | Resize browser / devtools |
| 3 | ✅ **Dark theme** matches existing design (brand-lime, panel-bg, etc.) | Visual inspection |
| 4 | ✅ **Loading state** handled (skeleton or spinner) | Simulate slow API / throttle network |
| 5 | ✅ **Error state** handled (user-friendly message, retry option) | Simulate API failure / network off |
| 6 | ✅ **Empty state** handled (meaningful "no data" message) | Test with no data |
| 7 | ✅ **All props** typed with TypeScript interfaces | `npx tsc --noEmit` |
| 8 | ✅ **Accessibility**: labels, roles, keyboard navigation | Tab through, screen reader check |
| 9 | ✅ **No console errors or warnings** | Browser console |
| 10 | ✅ **Lint passes** | `npm run lint` (or equivalent) |
| 11 | ✅ **Formatting passes** | `npm run format` (or equivalent) |
| 12 | ✅ **Build passes** | `npm run build` (or equivalent) |
| 13 | ✅ **Automated QA script** covers core interactions | `node qa/test_*.mjs` |

## End-to-End QA Suite (19 routes)

The individual component QA scripts have been consolidated into a single pipeline:

| QA Script | Coverage | Tests | Status |
|-----------|----------|-------|--------|
| `qa/test_full_pipeline.mjs` | 19 routes: report flow, processing, 5 citizen, 2 officer, 3 dept, 3 admin, 5 super admin, 3 public/shared | 19 interactions | ✅ All pass, 0 errors |

---

## Page / Feature Checklist

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | ✅ All route transitions work | Navigate in browser |
| 2 | ✅ **Backend endpoint** exists (if applicable) | `curl` or Swagger UI |
| 3 | ✅ **End-to-end** flow works from user perspective | Manual walkthrough |
| 4 | ✅ **No regressions** on other pages | Smoke-test adjacent pages |
| 5 | ✅ **Error boundary** catches unexpected crashes | Throw test error |
| 6 | ✅ **Responsive** across breakpoints | Test at 375 / 768 / 1280+ px |

---

## API Endpoint Checklist

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | ✅ Returns **correct status code** (200/201/4xx/5xx) | `curl` or tests |
| 2 | ✅ Returns **structured error body** on failure | `{ "detail": "..." }` |
| 3 | ✅ **Validates input** (Pydantic / type checks) | Send invalid payload |
| 4 | ✅ **Authentication** enforced (if applicable) | Call without token |
| 5 | ✅ **Authorization** enforced (if applicable) | Call with wrong role |
| 6 | ✅ **CORS** configured for frontend origin | Test cross-origin request |
| 7 | ✅ **Rate limiting** considered (if high-traffic) | Review |
| 8 | ✅ **SSE** connections close cleanly (if streaming) | Check on disconnect |

---

## Commit Checklist

Before every commit:

```
✓ One component / feature per commit
✓ Lint passes
✓ Build passes
✓ App runs without errors
✓ No .env files or secrets committed
✓ No debug code (console.log, TODO comments)
✓ CHANGELOG.md updated (if user-facing change)
✓ PROJECT_WORKFLOW.md updated (current task → next)
✓ Automated QA script written and passed (if UI component)
✓ No console errors
✓ No unused imports or variables
```
