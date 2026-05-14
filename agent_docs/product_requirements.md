# Product Requirements

*Extracted from PRD-NBADraftModel-MVP.md*

## Executive Summary
**Product:** NBA Draft Model
**Version:** MVP (1.0)
**Vision:** A data-driven web application that objectively evaluates NBA draft prospects using machine learning — surfacing player similarity comparisons, metric importance rankings, and prospect grades to give fans and analysts an evidence-based view of the draft class.

## Target Audience

### Primary Persona: Die-Hard NBA Fan / Draft Follower
- **Demographics:** 18–40, sports-savvy, follows draft coverage closely
- **Jobs to Be Done:**
  1. Understand which prospects are most likely to translate to NBA success
  2. Contextualize a prospect by seeing which current/historical player they resemble
  3. Identify strengths and weaknesses objectively, not through pundit opinion

## User Stories

### Primary Stories (Must Have)

**US-01:** As a die-hard fan, I want to see which historical NBA player a prospect most resembles so that I can contextualize their upside and fit.
- Similarity based on pre-draft metrics, not post-draft performance
- Top N most similar players with similarity score and shared traits

**US-02:** As a fan, I want to see a prospect's strengths and weaknesses quantified so that I can objectively identify their player archetype.
- Metric breakdown showing percentile ranks within draft class
- Data-derived archetype labels (e.g., "3-and-D Wing", "Pass-First Guard")

**US-03:** As a fan, I want to understand which pre-draft metrics most strongly predict NBA success so that I can assess prospects myself.
- Metric importance view ranked by predictive weight (feature importances/SHAP)
- Plain-language explanations for each metric

**US-04:** As a recruiter reviewing this project, I want the UI to look polished and intentional so that I can assess the developer's design sensibility.
- WCAG 2.1 AA compliance
- Modern technical aesthetic (not generic vibe-coded)

## Functional Requirements

### Must Have — P0 (MVP)

#### F-01: Prospect Explorer
- Browse and search current draft class
- Filter by position without full page reload
- Prospect detail page loads in < 2 seconds
- Includes: name, position, school, age, draft projection

#### F-02: Advanced Analytics Profile
- Per-prospect display of advanced and raw pre-draft statistics
- Percentile rankings within draft class
- Minimum 10 distinct metrics per prospect
- Percentile bars or radar chart visualization
- Data sourced exclusively from objective statistics

#### F-03: Historical Player Similarity Engine
- ML-based comparison to historical NBA draft profiles
- Top 3–5 most similar players per prospect
- Similarity computed using normalized pre-draft stats (not post-draft)
- Each comp displays historical player's actual NBA outcome (career PER, win shares, or equivalent)
- Methodology visible to user

#### F-04: Metric Importance Analysis
- Global view of most predictive pre-draft metrics
- Ranked list or bar chart of feature importances (SHAP-derived)
- Minimum 8 metrics ranked
- Plain-language explanations for each metric
- User can see how any prospect performs on high-importance metrics

#### F-05: Clean, Accessible UI
- Modern technical aesthetic suitable for portfolio
- Consistent design tokens, responsive layout
- WCAG 2.1 AA contrast ratios throughout
- Fully functional on desktop and mobile
- No placeholder/lorem ipsum content
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

### Should Have — P1 (Post-MVP)

#### F-06: Draft Big Board
- Ranked list by model-predicted success probability
- Filterable by position, tier, or archetype

#### F-07: Team Fit Analysis
- Show which NBA teams benefit most from a prospect's archetype
- Based on statistical need gaps

### Out of Scope — Won't Have (MVP)

- Player highlight clips (licensing issues)
- Public opinions / Twitter sentiment
- Non-NBA league targets
- User accounts / saved boards
- Real-time data updates

## Non-Functional Requirements

### Performance
- Prospect page load: < 2 seconds
- Filter/sort operations: < 500ms (client-side)
- Similarity scores: pre-computed at build time

### Accessibility
- WCAG 2.1 AA compliance
- All images have alt text
- Keyboard-navigable UI
- Minimum 4.5:1 contrast ratio for normal text

### Platform & Browser Support
- Web application (desktop-first, mobile-responsive)
- Chrome, Safari, Firefox, Edge (latest 2 versions)
- iOS 15+, Android 11+

### Cost
- $0 — all data sources, libraries, hosting must be free
- No paid APIs or hosting tiers

### Security / Privacy
- No user data collected
- No authentication required
- Static or server-rendered public data only

## Success Metrics

| Metric | Definition of Success |
|--------|----------------------|
| Model validity | Feature importances align with basketball analytics consensus |
| Comparison quality | Player comps pass the "eye test" for well-known prospects |
| UI quality | Presentable in portfolio context without disclaimer |
| Accessibility | Zero WCAG 2.1 AA violations in automated audit |
| Completeness | All P0 features functional with no critical bugs |

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

## MVP Definition of Done

### Feature Complete
- [ ] All P0 features (F-01 through F-05) implemented and functional
- [ ] All acceptance criteria met per feature
- [ ] No critical bugs on desktop or mobile

### Quality
- [ ] WCAG 2.1 AA audit passing
- [ ] Core Web Vitals acceptable
- [ ] No placeholder content in deployed version
- [ ] Similarity comps reviewed manually for face validity

### Documentation
- [ ] Methodology page live in app
- [ ] Data sources documented
- [ ] README with setup instructions in repo

### Deployment
- [ ] Deployed to free hosting (Vercel)
- [ ] Public URL accessible without login

---

*For technical implementation details, see `tech_stack.md` and `code_patterns.md`.*
*For testing strategy, see `testing.md`.*
