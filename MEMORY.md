# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal
**Current Phase:** MVP Development — Phase 3: Deployment & Version Control 🚀
**Current Task:** Set up GitHub repository and deploy to Vercel
**Goal:** Deploy to Vercel free tier with proper version control

**Phase 1 Completed:** ✅ Python ML Pipeline
- All 8 modules built, tested, and validated
- Model performance: **Spearman rho = 0.383 > 0.35 target** ✓
- 5 JSON files exported to frontend/public/data/
- **Enhanced:** Position/size-weighted player comparisons (30% position, 20% height, 50% playing style)
- **Enhanced:** Age adjustment reduced from 5% to 1% per year to reduce demographic bias

**Phase 2 Completed:** ✅ Frontend Implementation
- ✅ Next.js 15 + TypeScript + Tailwind CSS v3 setup
- ✅ Type definitions matching JSON schema (Prospect, Comparison, MetricImportance, etc.)
- ✅ Data utilities (getProspects, getComparisons, getBigBoard, etc.)
- ✅ Navigation with responsive mobile menu
- ✅ Footer component
- ✅ Global layout with nav + footer
- ✅ Home page / draft big board with position filtering and sorting
- ✅ Prospect profile pages (49 dynamic routes) with stats, comparisons, SHAP explanations
- ✅ Metric importance page with interactive bar chart
- ✅ About/methodology page with full documentation
- ✅ Production build successful (54 pages generated)
- ✅ TypeScript strict mode with zero errors
- ✅ Accessibility features (keyboard navigation, ARIA labels, semantic HTML)
- ✅ **Aesthetic improvements:** Enhanced spacing, typography, borders for better readability
  - Increased padding throughout (p-4→p-6, p-6→p-8)
  - Larger text sizes (text-sm→text-base, text-lg→text-xl)
  - Thicker borders (border→border-2, rounded-lg→rounded-xl)
  - Better visual hierarchy with enhanced hover states

**Phase 3 In Progress:** 🚀 Deployment & Version Control
- [ ] Initialize Git repository
- [ ] Create .gitignore for Python and Next.js
- [ ] Push to GitHub
- [ ] Deploy to Vercel free tier
- [ ] Test deployed site (all pages, mobile responsiveness)
- [ ] Run Lighthouse audit on live site
- [ ] Update README with live URL
- [ ] Add project to portfolio

**Next Steps:**
1. Set up GitHub repository with proper .gitignore
2. Deploy to Vercel free tier
3. Validate production deployment
4. Add live URL to README and portfolio

## 📂 Architectural Decisions
*(Log specific choices made during the build here so future agents respect them)*
- **2025-05-14** - Chose Jamstack architecture (offline Python pipeline → static JSON → Next.js SSG) to achieve $0 hosting cost on Vercel free tier
- **2025-05-14** - Selected XGBoost over Random Forest for success prediction due to better performance on tabular data and mature SHAP integration
- **2025-05-14** - Using cosine similarity over KNN/Euclidean for player comparisons because it's magnitude-insensitive and works well with normalized feature vectors
- **2025-05-14** - All ML inference happens at build time (offline) — no runtime ML in browser to keep deployment simple and free
- **2025-05-14** - Caching all Basketball-Reference and nba_api responses locally to avoid rate limits and ToS violations on re-scrapes
- **2026-05-14** - Used existing draft-model-data.csv (771 players, 2010-2026) as base dataset instead of scraping from scratch
- **2026-05-14** - Inferred player positions from stats (height + assist rate + shooting patterns) since combine data not fully available
- **2026-05-14** - Added 8 derived metrics: True Shooting %, FT%, 3P%, Rim%, AST/TO ratio, dunk rate, estimated FGA
- **2026-05-14** - Pipeline structure: src/ingest (data loading), src/features (engineering), src/models (ML), src/export (JSON)
- **2026-05-14** - XGBoost hyperparameters: max_depth=4, learning_rate=0.05, n_estimators=200, subsample=0.8 (achieved Spearman rho=0.387)
- **2026-05-14** - Used z-score normalization by position for fair player comparisons (guards vs guards, bigs vs bigs)
- **2026-05-14** - Top 3 predictive features: age (0.1006), international (0.0734), defensive_composite (0.0654)
- **2026-05-14** - JSON schema matches TypeScript interfaces from tech_stack.md for type safety
- **2026-05-14** - Pipeline orchestration via bash script (run_pipeline.sh) for repeatable builds
- **2026-05-14** - Frontend: Next.js 15 (App Router, static export), TypeScript strict mode, Tailwind CSS v3 (downgraded from v4 for stability)
- **2026-05-14** - Dark theme (navy background #0a0f1e) for portfolio aesthetic, custom color palette for grade tiers
- **2026-05-14** - Enhanced player comparison algorithm: 30% position similarity, 20% height similarity, 50% playing style (cosine similarity) for better prospect matching
- **2026-05-14** - Reduced age adjustment from 5% to 1% per year to minimize demographic bias, though age remains important predictor (23.6% SHAP importance)
- **2026-05-14** - Added L1/L2 regularization (alpha=1.0, lambda=3.0) and reduced model complexity (max_depth=3, n_estimators=150) to prevent overfitting
- **2026-05-14** - Aesthetic improvements: Increased padding, larger text (text-base/lg/xl), thicker borders (border-2), rounded-xl corners, enhanced spacing for better readability

## 🐛 Known Issues & Quirks
*(Log current bugs or weird workarounds here)*
- Basketball-Reference scraping must respect 1 request/3 seconds throttle to avoid rate limiting
- Combine data may be incomplete for current draft class (fall back to college stats only if needed)
- nba_api is unofficial and rate-limit sensitive — always cache responses
- International players lack conference strength data — using median imputation for competition adjustment

## 📜 Completed Phases
- [ ] **Phase 1: Python ML Pipeline** (Week 1)
  - [ ] Repo structure and environment setup
  - [ ] Data ingestion (scraping + caching)
  - [ ] Feature engineering
  - [ ] Model training (XGBoost + similarity)
  - [ ] JSON export with validation
- [ ] **Phase 2: Frontend Build** (Week 2)
  - [ ] Next.js project initialization
  - [ ] Draft Big Board page
  - [ ] Prospect Profile page
  - [ ] Metric Importance page
  - [ ] Methodology page
  - [ ] WCAG accessibility audit
- [ ] **Phase 3: Deployment**
  - [ ] GitHub Actions CI/CD
  - [ ] Vercel deployment
  - [ ] End-to-end validation

## 🎯 Success Criteria Checklist
**P0 Features (Must Have):**
- [ ] F-01: Prospect Explorer (browse/filter current draft class)
- [ ] F-02: Advanced Analytics Profile (percentile rankings per prospect)
- [ ] F-03: Historical Player Similarity Engine (ML-based comps)
- [ ] F-04: Metric Importance Analysis (SHAP-derived feature importance)
- [ ] F-05: Clean, Accessible UI (WCAG 2.1 AA compliant)

**Technical Done Definition:**
- [ ] Python pipeline runs end-to-end with no errors
- [ ] All `test_model_validity.py` tests pass
- [ ] Spearman rank correlation on holdout draft classes > 0.35
- [ ] All P0 JSON outputs present and schema-valid
- [ ] `next build` exits 0 with no TypeScript errors
- [ ] All pages render correctly on desktop (1280px) and mobile (375px)
- [ ] Lighthouse accessibility score ≥ 90
- [ ] WCAG 2.1 AA: zero critical violations
- [ ] Live Vercel URL accessible

## 📝 Implementation Notes
- Target variable: `career_win_shares_per_48` over first 5 seasons (≥ 82 games minimum)
- Historical training data: All drafted players 1990–2019 with complete pre-draft data
- Validation strategy: Leave-one-draft-class-out cross-validation (prevents temporal leakage)
- JSON outputs location: `frontend/public/data/` (prospects.json, comparisons.json, metric_importance.json, big_board.json)

---
*Last Updated: 2025-05-14*
*Next Review: After Week 1 completion*
