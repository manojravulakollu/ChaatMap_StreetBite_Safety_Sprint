# ChaatMap: StreetBite Safety Sprint
## Project documentation

### Overview
ChaatMap is a responsive street-food discovery and community observation prototype. It combines a Leaflet map, vendor directory, area/delicacy filters, transparent multi-factor hygiene scoring, structured review submission, and concern reporting.

**Demo data disclaimer:** The 20 vendor profiles and 50 reviews are synthetic fixtures for demonstration. Names, coordinates, prices, hours, ratings, routes, and badges must not be represented as verified real-world vendor information. The sample city map is Hyderabad for prototype context.

### Technology
- React + Vite frontend
- Leaflet / React-Leaflet + OpenStreetMap tiles
- Node.js + Express REST API
- JSON files for local demo persistence

### Hygiene score
Each factor is rated from 1 to 5:
`Score = 0.40 × Water + 0.25 × CoveredFood + 0.20 × Gloves + 0.15 × Surroundings`
The result remains on a 1–5 scale. A vendor's displayed score is recalculated from all structured community reviews when reviews exist; otherwise it uses the illustrative seed scores.

### Main API endpoints
- `GET /api/health`
- `GET /api/vendors?area=&dish=&q=&sort=score`
- `GET /api/vendors/:id`
- `POST /api/vendors/:id/reviews`
- `POST /api/vendors/:id/report`
- `GET /api/trails`

### Run locally
Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```
Open `http://localhost:5173`. Vite proxies `/api` requests to Express on port 4000.

### Demo steps
1. Open the app and search `Pani Puri`.
2. Select `Sindhi Colony` in the area filter.
3. Select a vendor card or map marker to open its detail panel.
4. Inspect the four factor scores and the formula.
5. Click **Add hygiene review**, submit four ratings, and observe the score/review count refresh.
6. Submit a sample hygiene concern to demonstrate reporting.
7. Clear filters and inspect the food-trail and community spotlight panels.

### Privacy, safety and trust limitations
- The prototype does not collect account identity or require login.
- The optional comment is length-limited and sanitized but is not a substitute for moderation.
- Reviews are not independently verified; multiple reviews do not prove food safety.
- FSSAI status is shown as **not verified**. A green verification badge must only be enabled after a trusted official verification workflow is implemented.
- Photo upload is not implemented in this starter build; photo URLs are intentionally blank. Add secure file storage, size/type checks, moderation, and consent before production use.
- Open/closed status is demo fixture data, not live status.
- Map tiles require internet access. Offline tile caching is not included.
- JSON file storage is suitable for a local hackathon demo, not concurrent production traffic. Use SQLite/PostgreSQL, authentication, rate limits, audit logs, moderation, and backup strategy before public deployment.

### Evaluation checklist
- [x] Vendor directory and map markers
- [x] Area and specialty filters
- [x] Four-factor hygiene rating
- [x] Weighted composite score
- [x] Dynamic score recalculation after review
- [x] Review and concern submission
- [x] 20 synthetic vendors and 50 synthetic reviews
- [x] Food-trail recommendations
- [ ] Official FSSAI verification integration
- [ ] Secure image upload and moderation
- [ ] Live vendor status and offline maps
