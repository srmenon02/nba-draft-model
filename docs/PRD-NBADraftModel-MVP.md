# Product Requirements Document: NBA Draft Model MVP

## Executive Summary

**Product:** NBA Draft Model
**Version:** MVP (1.0)
**Document Status:** Draft
**Last Updated:** 2025-05-14

### Product Vision
A data-driven web application that objectively evaluates NBA draft prospects using machine learning — surfacing player similarity comparisons, metric importance rankings, and prospect grades to give fans and analysts an evidence-based view of the draft class.

### Success Criteria
- Defensible prospect rankings with clear, quantifiable criteria
- Accurate historical player comparisons grounded in pre-draft profile data
- Clean, modern UI presentable as a portfolio/recruiter artifact
- Zero ongoing cost

---

## Problem Statement

### Problem Definition
NBA draft coverage is dominated by subjective scouting takes, media narratives, and gut-feel big boards. There is no widely accessible, objective tool that quantifiably evaluates prospects, compares them to historical players using statistical similarity, and ranks which pre-draft metrics actually predict NBA success.

### Impact Analysis
- **User Impact:** Fans and analysts lack a data-backed counterpoint to subjective draft media
- **Portfolio Impact:** Demonstrates full-stack ML + data engineering + UI skills for technical recruiting
- **Scope:** Side project — no revenue or growth targets

---

## Target Audience

### Primary Persona: Die-Hard NBA Fan / Draft Follower
**Demographics:** 18–40, sports-savvy, follows draft coverage closely, comfortable reading stats

**Jobs to Be Done:**
1. Understand which prospects are most likely to translate to NBA success
2. Contextualize a prospect by seeing which current/historical player they resemble
3. Identify a prospect's strengths and weaknesses objectively, not through pundit opinion

**Current Solutions & Pain Points:**
| Current Solution | Pain Points | Our Advantage |
|-----------------|-------------|---------------|
| ESPN/The Ringer draft coverage | Subjective, personality-driven | Fully quantitative |
| Basketball-Reference | Raw data, no synthesis | Insight layer on top of data |
| Twitter/YouTube scouting | Anecdotal, biased | No opinion, only metrics |

### Secondary Persona: General NBA / Sports Fan
Casual follower who wants a quick, readable breakdown of top prospects without digging into raw stats.

---

## User Stories

### Primary Stories

**US-01:** As a die-hard fan, I want to see which historical NBA player a prospect most resembles so that I can contextualize their upside and fit for a given team.
- AC: Given a selected prospect, the app displays the top N most similar historical players with a similarity score and shared statistical profile
- AC: Similarity is based on pre-draft metrics, not post-draft performance

**US-02:** As a fan, I want to see a prospect's strengths and weaknesses quantified so that I can objectively identify their player archetype.
- AC: Each prospect has a metric breakdown showing percentile ranks within their draft class
- AC: Archetype label (e.g., "3-and-D Wing", "Pass-First Guard") is derived from data, not manually assigned

**US-03:** As a fan, I want to understand which pre-draft metrics most strongly predict NBA success so that I can assess current and future prospects myself.
- AC: A metric importance view ranks features by predictive weight (e.g., from the ML model's feature importances or SHAP values)
- AC: Each metric includes a plain-language explanation of what it measures and why it matters

**US-04:** As a recruiter reviewing this project, I want the UI to look polished and intentional so that I can assess the developer's design sensibility alongside their technical skills.
- AC: UI adheres to WCAG 2.1 AA contrast and accessibility standards
- AC: Design avoids generic "vibe-coded" aesthetics — uses a modern technical aesthetic with consistent spacing, typography, and color tokens

---

## Functional Requirements

### Must Have — P0

#### F-01: Prospect Explorer
- **Description:** Browse and search the current draft class; select any prospect to view their full profile
- **Includes:** Name, position, school/team, age, draft projection, headshot placeholder
- **AC:**
  - [ ] All prospects in current draft class are listed
  - [ ] Filtering by position works without full page reload
  - [ ] Prospect detail page loads in < 2 seconds

#### F-02: Advanced Analytics Profile
- **Description:** Per-prospect display of advanced and raw pre-draft statistics with percentile rankings within the draft class
- **Includes:** Scoring efficiency, rebounding, playmaking, athleticism (combine), defensive metrics
- **AC:**
  - [ ] At minimum 10 distinct metrics displayed per prospect
  - [ ] Percentile bars or radar chart visualization included
  - [ ] Data sourced exclusively from objective statistics (no scouting text)

#### F-03: Historical Player Similarity Engine
- **Description:** ML-based comparison of each prospect to historical NBA draft profiles; surfaces top 3–5 most similar players
- **Includes:** Similarity score, comparable player's career outcome summary, shared statistical traits
- **AC:**
  - [ ] Similarity computed using normalized pre-draft stats (not post-draft)
  - [ ] Each comp displays the historical player's actual NBA outcome (career PER, win shares, or equivalent)
  - [ ] Methodology is documented/visible to user

#### F-04: Metric Importance Analysis
- **Description:** A global view showing which pre-draft metrics are most predictive of NBA success, derived from the ML model
- **Includes:** Ranked list or bar chart of feature importances, plain-language explanations
- **AC:**
  - [ ] Importances are model-derived (e.g., SHAP, feature importance from XGBoost/RF)
  - [ ] At minimum 8 metrics ranked
  - [ ] User can see how any individual prospect performs on each high-importance metric

#### F-05: Clean, Accessible UI
- **Description:** Modern technical aesthetic suitable for portfolio presentation
- **Includes:** Consistent design tokens, responsive layout, accessible color contrast
- **AC:**
  - [ ] WCAG 2.1 AA contrast ratios met throughout
  - [ ] Fully functional on desktop and mobile (responsive)
  - [ ] No placeholder/lorem ipsum content in any deployed view
  - [ ] Core Web Vitals in acceptable range (LCP < 2.5s, CLS < 0.1)

---

### Should Have — P1

#### F-06: Draft Big Board
- Ranked list of all prospects by model-predicted success probability
- Filterable by position, tier, or similarity archetype

#### F-07: Team Fit Analysis
- For a selected prospect, show which NBA teams' current rosters would benefit most from their archetype
- Based on statistical need gaps, not roster opinion

---

### Could Have — P2

#### F-08: Player Archetype Write-Ups (Generated)
- Short model-informed text summaries of each prospect's profile (not manually authored)

#### F-09: New/Novel Advanced Metrics
- Custom-derived metrics not available in standard databases (e.g., adjusted production index)

#### F-10: Archetype Clustering View
- Visual cluster map grouping prospects by statistical archetype

---

### Out of Scope — Won't Have (MVP)

| Feature | Reason Excluded |
|---------|----------------|
| Player highlight clips | External media licensing; subjective |
| Public opinions / Twitter sentiment | Out of scope by design |
| Non-NBA league targets | Scope constraint |
| User accounts / saved boards | Unnecessary for side project MVP |
| Real-time data updates | Static dataset sufficient for draft season |

---

## Non-Functional Requirements

### Performance
- Prospect page load: < 2 seconds
- Filter/sort operations: < 500ms (client-side where possible)
- Similarity query: pre-computed at build time, not runtime

### Accessibility
- WCAG 2.1 AA compliance throughout
- All images have alt text
- Keyboard-navigable UI
- Sufficient color contrast (minimum 4.5:1 for normal text)

### Platform & Browser Support
- Web application (desktop-first, mobile-responsive)
- Chrome, Safari, Firefox, Edge (latest 2 versions)
- iOS 15+, Android 11+

### Cost
- $0 — all data sources, libraries, hosting, and tooling must be free
- No paid APIs; no paid hosting tiers required for side project traffic

### Security / Privacy
- No user data collected
- No authentication required
- Static or server-rendered public data only

### Scalability
- Side project scale — optimized for correctness and presentation, not high traffic
- Static site generation or lightweight backend acceptable

---

## Technical Constraints

- **Language:** Python (backend/ML pipeline)
- **Data Sources:** Free only (Basketball-Reference, NBA Stats API, nba_api, combine data)
- **ML Libraries:** scikit-learn, XGBoost/LightGBM, pandas, numpy
- **Frontend:** Modern web stack (React or similar); no cost tooling
- **Hosting:** Free tier (Vercel, Netlify, Render, or GitHub Pages)
- **All similarity scores pre-computed** — no real-time ML inference in the browser

---

## Success Metrics

Since this is a side project, success is defined qualitatively and technically:

| Metric | Definition of Success |
|--------|----------------------|
| Model validity | Feature importances align with established basketball analytics consensus |
| Comparison quality | Player comps pass the "eye test" for well-known prospects |
| UI quality | Presentable in a portfolio/recruiter context without disclaimer |
| Accessibility | Zero WCAG 2.1 AA violations in automated audit |
| Completeness | All P0 features functional with no critical bugs |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Insufficient combine/pre-draft data for current class | High | High | Supplement with college stats; document data gaps transparently |
| Query performance on large historical dataset | Medium | Medium | Pre-compute all similarity scores offline; serve static JSON |
| Model produces non-obvious/non-defensible outputs | Medium | High | Use interpretable models (XGBoost + SHAP); display feature contributions per player |
| 2-week timeline too tight for full feature set | High | Medium | P0 features only for launch; P1 features are post-MVP |
| Basketball-Reference scraping rate limits or ToS issues | Medium | High | Cache all data locally after initial scrape; use nba_api where possible |

---

## Information Architecture

```
├── Home / Draft Board
│   └── Prospect list (filterable, sortable)
├── Prospect Profile: [Name]
│   ├── Analytics breakdown (percentile bars / radar)
│   ├── Player similarity comps
│   └── Metric importance (how this player scores on predictive metrics)
├── Metric Importance (global view)
│   └── Ranked features with explanations
└── About / Methodology
    └── Data sources, model explanation, scope
```

---

## Constraints & Timeline

**Budget:** $0
**Timeline:** 2 weeks from start
**Team:** Solo

### Suggested 2-Week Breakdown

| Week | Focus |
|------|-------|
| Week 1 | Data collection pipeline, feature engineering, ML model training, similarity engine |
| Week 2 | Frontend build, data integration, UI polish, accessibility audit, deployment |

---

## Open Questions & Assumptions

**Open Questions:**
- Which metrics are available for the current draft class vs. historical players? (Combine data may be incomplete pre-draft)
- What is the best free hosting option that supports a Python backend, if needed?
- Will pre-draft college stats be normalized to account for conference strength?

**Assumptions:**
- Basketball-Reference and nba_api provide sufficient historical pre-draft data (1990–present)
- The current draft class has enough publicly available college/combine stats for meaningful comparison
- "NBA success" target variable will be defined as career win shares or BPM (to be finalized in technical design)
- Similarity matching will use cosine similarity or KNN on normalized feature vectors

---

## MVP Definition of Done

### Feature Complete
- [ ] All P0 features (F-01 through F-05) implemented and functional
- [ ] All acceptance criteria met per feature
- [ ] No critical bugs on desktop or mobile

### Quality
- [ ] WCAG 2.1 AA audit passing (automated + manual spot check)
- [ ] Core Web Vitals acceptable
- [ ] No placeholder content in deployed version
- [ ] Similarity comps reviewed manually for face validity on known prospects

### Documentation
- [ ] Methodology page live in app
- [ ] Data sources documented
- [ ] README with setup instructions in repo

### Deployment
- [ ] Deployed to free hosting (Vercel / Netlify / Render)
- [ ] Public URL accessible without login

---

## Next Steps

1. Approve and finalize this PRD
2. Create Technical Design Document (Part 3) — data pipeline, model architecture, API/component design
3. Set up Python data pipeline and collect historical data
4. Train similarity and success prediction models
5. Build frontend with pre-computed data
6. Accessibility audit + polish
7. Deploy

---
*PRD Version: 1.0*
*Status: Draft — Ready for Technical Design*
*Owner: Side Project*
