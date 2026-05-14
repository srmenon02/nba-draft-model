# Project Brief

## Product Vision
A data-driven web application that objectively evaluates NBA draft prospects using machine learning — surfacing player similarity comparisons, metric importance rankings, and prospect grades to give fans and analysts an evidence-based view of the draft class.

## Core Value Proposition
- **For Fans:** Get an objective, quantitative view of draft prospects beyond subjective media narratives
- **For Analysts:** Access ML-powered player comparisons based on pre-draft statistical profiles
- **For Developer (Portfolio):** Demonstrate full-stack ML + data engineering + frontend skills

## Project Scope & Constraints
- **Type:** Side project / portfolio piece
- **Budget:** $0 (all tools, hosting, and data sources must be free)
- **Timeline:** 2 weeks from start
- **Team:** Solo
- **Target Audience:** Die-hard NBA fans, draft followers, recruiters
- **Success Definition:** Portfolio-ready MVP with all P0 features functional

## Technical Philosophy
- **Jamstack Architecture:** Offline data processing → static JSON → static site generation
- **Zero Runtime ML:** All predictions pre-computed at build time (no inference in browser)
- **Accessibility First:** WCAG 2.1 AA compliance throughout
- **Modern Technical Aesthetic:** Clean, intentional design suitable for portfolio presentation
- **No Opinions, Only Data:** Fully quantitative analysis with no subjective scouting text

## Coding Conventions

### Python (ML Pipeline)
- Black formatting (line length 100)
- Ruff linting (replaces flake8 + isort)
- Type hints for all function signatures
- Google-style docstrings
- Cache all external API responses
- Write tests for all feature engineering functions

### TypeScript (Frontend)
- Strict TypeScript (no `any` types)
- ESLint + Prettier
- Functional components with hooks
- Tailwind CSS for all styling
- Feature-based folder organization
- WCAG 2.1 AA compliance for all UI

## Architectural Conventions
- **Data flows one direction:** Python pipeline → JSON → Next.js build → Static HTML
- **No runtime APIs:** All data loaded at build time via static JSON imports
- **Separation of concerns:** ML logic stays in Python; UI logic stays in TypeScript
- **Pre-computed everything:** Similarity scores, predictions, metric rankings all calculated offline
- **Cache aggressively:** Never re-scrape Basketball-Reference or nba_api without explicit approval

## Quality Gates
- **Python:** All pytest tests pass, Black/Ruff checks pass
- **TypeScript:** TypeScript compilation succeeds, ESLint passes, no type errors
- **Model validity:** Spearman rank correlation > 0.35 on holdout draft classes
- **Accessibility:** Lighthouse accessibility score ≥ 90, zero critical WCAG violations
- **Mobile:** All pages functional and readable on 375px viewport
- **Performance:** LCP < 2.5s, CLS < 0.1

## Key Commands

### Pipeline
```bash
cd pipeline
pip install -r requirements.txt
bash run_pipeline.sh      # Full pipeline execution
pytest tests/ -v          # Run tests
black . && ruff check .   # Lint/format
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # Start dev server
npm run build             # Build for production
npm run lint              # Run ESLint
```

## Protected Areas (Do Not Modify Without Approval)
- `pipeline/data/raw/` — Cached API responses (risk of rate limiting if deleted)
- `.github/workflows/` — CI/CD configuration
- GitHub secrets and deployment configuration

## Update Cadence
- **MEMORY.md:** Update after every major milestone or architectural decision
- **Project Brief (this file):** Update if core conventions or commands change
- **Tech Stack:** Update when adding new major dependencies
- **Code Patterns:** Update when establishing new repeatable patterns

## Known Limitations & Trade-offs
- **No real-time data:** Model only as current as last pipeline run
- **Small training set:** ~1,500 players limits model complexity
- **Combine data gaps:** Not all prospects participate in combine; median imputation used
- **International players:** Competition adjustment is approximate for non-NCAA leagues
- **Portfolio scope:** Optimized for correctness and presentation, not high traffic

## Development Workflow
1. **Plan:** Propose approach before implementing
2. **Implement:** Build one feature at a time
3. **Test:** Run automated tests + manual verification
4. **Verify:** Check linting, type checking, accessibility
5. **Update:** Log architectural decisions in MEMORY.md
6. **Commit:** Checkpoint after each working feature

## Communication Style (For AI Assistants)
- **Be concise:** State issues and fix them; avoid repetitive apologies
- **Ask when unsure:** One specific question if critical context missing
- **Explain trade-offs:** When recommending, mention alternatives
- **Plan before coding:** Propose steps, wait for approval
- **Verify after changes:** Show test output or browser verification

---

*Last Updated: 2025-05-14*
*Next Review: After Week 1 completion*
