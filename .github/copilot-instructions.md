# GitHub Copilot Instructions for NBA Draft Model

## Project Context
**App:** NBA Draft Model
**Stack:** Python ML Pipeline (XGBoost, SHAP, scikit-learn) → Static JSON → Next.js 15 (TypeScript, Tailwind CSS)
**Architecture:** Jamstack — Offline ML pipeline generates static JSON consumed by Next.js SSG
**Stage:** MVP Development
**User Level:** Vibe-coder (AI does heavy lifting, human guides and tests)

## Directives

### 1. Read Master Plan First
Always read `AGENTS.md` for the current phase, active tasks, and high-level context. Refer to `MEMORY.md` for the current goal and next steps.

### 2. Consult Documentation
Refer to `agent_docs/` for detailed implementation guidance:
- **tech_stack.md** — Complete tech stack, setup commands, data flow
- **code_patterns.md** — Architecture patterns, conventions, code examples
- **product_requirements.md** — Feature requirements and acceptance criteria
- **project_brief.md** — Project vision, conventions, quality gates
- **testing.md** — Testing strategy and verification procedures

### 3. Plan Before Implementing
Propose a brief step-by-step plan before making changes to more than one file. Wait for approval before proceeding.

### 4. Build Incrementally
Implement one small feature at a time. Test after each feature. Do not skip ahead to "nice-to-have" features before completing "must-have" features.

### 5. Run Verification After Changes

**Python:**
```bash
cd pipeline
pytest tests/ -v          # Run tests
black . && ruff check .   # Lint/format
```

**Frontend:**
```bash
cd frontend
npm run lint              # ESLint
npm run build             # Type check + build verification
```

Fix all errors before marking a task complete.

### 6. Browser Verification Required
For frontend work, start the dev server (`npm run dev`) and visually verify changes in the browser before marking the task complete. Check both desktop and mobile viewports.

### 7. Update Memory
After completing a major milestone or making an architectural decision, update `MEMORY.md` with the decision and rationale.

### 8. No Linting Mode
Do not act as a linter or suggest style changes in isolation. Use `npm run lint` or `black .` commands to check code style.

### 9. Follow Existing Patterns
Check existing code in the repository before inventing new patterns. Reuse existing utilities and components where possible.

### 10. Be Concise
State issues briefly and fix them. Avoid repetitive apologies or filler text. If context is missing, ask ONE specific clarifying question.

## Commands Reference

### Python Pipeline
- `cd pipeline && pip install -r requirements.txt` — Install dependencies
- `cd pipeline && bash run_pipeline.sh` — Run full pipeline (ingest → features → models → JSON)
- `cd pipeline && pytest tests/ -v` — Run tests
- `cd pipeline && black . && ruff check .` — Format and lint

### Frontend
- `cd frontend && npm install` — Install dependencies
- `cd frontend && npm run dev` — Start dev server (http://localhost:3000)
- `cd frontend && npm run build` — Build for production
- `cd frontend && npm run lint` — Run ESLint

## What NOT To Do
- Do NOT delete files without explicit confirmation
- Do NOT modify `pipeline/data/raw/` (cached API responses — risk of rate limits)
- Do NOT skip tests for "simple" changes
- Do NOT bypass failing tests or linters
- Do NOT add new dependencies without checking existing `package.json` or `requirements.txt`
- Do NOT use `any` types in TypeScript — use `unknown` with type guards
- Do NOT generate fake/placeholder data in production JSON exports

## Type Safety Rules
- The `any` type is FORBIDDEN in TypeScript — use `unknown` with type guards
- All function parameters and returns must be typed
- Use TypeScript interfaces for all JSON data structures

## Architecture Rules
- Keep ML/data logic in Python (`pipeline/`)
- Keep UI logic in TypeScript (`frontend/`)
- All data loading happens at build time (no runtime API calls)
- Pre-compute all ML predictions offline (no inference in browser)
- Cache all external API responses to avoid rate limits

## Communication Style
- Explain what you're about to do before doing it (for complex changes)
- Show test output or browser verification as proof of completion
- If a change affects multiple areas, break it into smaller tasks
- Ask clarifying questions if requirements are ambiguous

## Success Criteria
This is a portfolio project. Success is defined as:
- All P0 features functional with no critical bugs
- Model produces defensible predictions (Spearman rho > 0.35)
- UI is polished and WCAG 2.1 AA compliant
- Deployed to Vercel with public URL

## Troubleshooting
- **Confused about project scope?** Read `AGENTS.md` completely first
- **Unsure about a pattern?** Check `agent_docs/code_patterns.md`
- **Need feature details?** See `agent_docs/product_requirements.md`
- **Tests failing?** Check `agent_docs/testing.md` for test strategy

---

*This file is specific to VS Code + GitHub Copilot. For other AI tools, see AGENTS.md.*
*Last Updated: 2025-05-14*
