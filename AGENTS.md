# AGENTS.md — Master Plan for NBA Draft Model

## Project Overview & Stack
**App:** NBA Draft Model
**Overview:** A data-driven web application that objectively evaluates NBA draft prospects using machine learning — surfacing player similarity comparisons, metric importance rankings, and prospect grades to give fans and analysts an evidence-based view of the draft class.
**Stack:** Python ML Pipeline (scikit-learn, XGBoost, SHAP, pandas) → Static JSON → Next.js 15 (TypeScript, Tailwind CSS, Recharts)
**Architecture:** Jamstack — Offline Python ML pipeline generates static JSON → Next.js SSG → Vercel CDN
**Critical Constraints:** $0 budget, Mobile-responsive design required, WCAG 2.1 AA compliance, All ML pre-computed (no runtime inference)

## Setup & Commands

### Python Pipeline
- **Setup:** `cd pipeline && pip install -r requirements.txt`
- **Run Pipeline:** `cd pipeline && bash run_pipeline.sh` (rebuilds all JSON)
- **Testing:** `cd pipeline && python -m pytest tests/ -v`
- **Linting:** `cd pipeline && black . && ruff check .`

### Frontend
- **Setup:** `cd frontend && npm install`
- **Development:** `cd frontend && npm run dev`
- **Testing:** `cd frontend && npm test`
- **Linting:** `cd frontend && npm run lint`
- **Build:** `cd frontend && npm run build`

## Protected Areas
Do NOT modify these areas without explicit human approval:
- **Data Sources:** Scraping logic in `pipeline/src/ingest/` — changes may violate ToS
- **Model Core:** Trained model artifacts in `pipeline/data/models/` — changes invalidate validation
- **GitHub Actions:** `.github/workflows/` — deployment configurations

## Coding Conventions

### Python (Pipeline)
- **Formatting:** Black (line length 100) + Ruff for linting
- **Type hints:** Required for all function signatures
- **Docstrings:** Google-style docstrings for all public functions
- **Testing:** All feature engineering functions must have unit tests
- **Data caching:** Always cache external API responses to avoid rate limits

### TypeScript (Frontend)
- **Formatting:** Prettier + ESLint (strict mode)
- **Type Safety:** Strict TypeScript. No `any` types — use `unknown` with type guards
- **Architecture:** Feature-based folder structure in `src/app/`
- **Components:** Functional components with TypeScript interfaces
- **Styling:** Tailwind CSS only — no inline styles or CSS modules
- **Accessibility:** All interactive elements must be keyboard-navigable; maintain WCAG 2.1 AA contrast

## How I Should Think
1. **Understand Intent First**: Before answering, identify what the user actually needs
2. **Ask If Unsure**: If critical information is missing, ask before proceeding
3. **Plan Before Coding**: Propose a plan, ask for approval, then implement
4. **Verify After Changes**: Run tests/linters or manual checks after each change
5. **Explain Trade-offs**: When recommending something, mention alternatives

## Agent Behaviors
These rules apply to all AI coding assistants:

1. **Plan Before Execution:** ALWAYS propose a brief step-by-step plan before implementing any feature
2. **Read Documentation First:** Always read `agent_docs/` files before starting work on unfamiliar areas
3. **Incremental Development:** Build one small feature at a time. Test after each feature.
4. **No Linting Mode:** Do not act as a linter. Use `npm run lint` or equivalent commands.
5. **Context Compaction:** Update `MEMORY.md` after each major milestone or architectural decision
6. **Verification Loop:** Run tests/linters after each feature; fix all failures before moving on
7. **Browser Verification Required:** For frontend work, open the dev server and verify visually before marking complete
8. **Pre-commit Discipline:** If pre-commit hooks exist, ensure they pass before committing

## What NOT To Do
- Do NOT delete files without explicit confirmation
- Do NOT modify `pipeline/data/raw/` cached data (re-scraping risks rate limits)
- Do NOT skip tests for "simple" changes
- Do NOT bypass failing tests or pre-commit hooks
- Do NOT add new dependencies without checking existing `package.json` or `requirements.txt` first
- Do NOT use deprecated libraries or patterns
- Do NOT generate fake/placeholder data in production JSON exports

## Engineering Constraints

### Type Safety (No Compromises)
- The `any` type is FORBIDDEN—use `unknown` with type guards
- All function parameters and returns must be typed
- Use Zod or TypeScript interfaces for JSON validation

### Architectural Sovereignty
- Routes/pages handle rendering ONLY
- All data transformation logic goes in `lib/` utilities
- No complex logic in React components — extract to hooks or utilities

### Library Governance
- Check existing `package.json` or `requirements.txt` before suggesting new dependencies
- Prefer native APIs over libraries where reasonable
- Follow the project's data-loading approach: Next.js static generation with JSON imports

### Clear Communication Rule
- State issues briefly and fix them immediately; do not repeat apologies or filler text
- If context is missing, ask ONE specific clarifying question before proceeding

### Workflow Discipline
- Pre-commit hooks must pass before commits (or ask if they should be bypassed)
- If verification fails, fix issues before continuing
- Update `MEMORY.md` after completing each major feature

## Current Phase & Active Tasks

**Phase:** MVP Development — Week 1: Python Pipeline
**Goal:** Build end-to-end data pipeline from raw data sources to validated JSON exports

**See `MEMORY.md` for current active task and next steps.**

## Documentation

For detailed implementation guidance, refer to:
- **`agent_docs/tech_stack.md`** — Complete tech stack details and setup
- **`agent_docs/code_patterns.md`** — Architecture patterns and conventions
- **`agent_docs/project_brief.md`** — Project vision and persistent conventions
- **`agent_docs/product_requirements.md`** — Complete feature requirements from PRD
- **`agent_docs/testing.md`** — Testing strategy and verification procedures

## Success Metrics

This is a portfolio/side project. Success is defined as:
- All P0 features (F-01 through F-05) functional with no critical bugs
- Model validity: Feature importances align with basketball analytics consensus
- Comparison quality: Player comps pass the "eye test" for known prospects
- UI quality: Presentable in portfolio context without disclaimer
- Accessibility: Zero WCAG 2.1 AA violations in automated audit
- Deployment: Live on Vercel free tier, public URL accessible

## Troubleshooting

**If AI seems confused:**
- Start with: "First, read AGENTS.md completely, then confirm you understand the project"

**If AI skips steps:**
- Say: "Let's go slower. Implement just [specific feature] and show me how to test it"

**If you get errors:**
- Say: "I got this error: [error]. Please explain what it means and how to fix it"

**If AI overcomplicates:**
- Say: "That seems complex. What's the simplest way to make this work for an MVP?"

---

*This file should be read first by any AI assistant working on this project.*
*Last Updated: 2025-05-14*
