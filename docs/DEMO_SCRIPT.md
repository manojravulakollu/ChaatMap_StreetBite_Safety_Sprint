# Hackathon demo script (4 minutes)

**Opening:** “ChaatMap helps people explore street-food carts while making hygiene observations more structured and transparent. Our prototype uses a weighted index, not an unverified star-only review.”

1. Search for **Pani Puri**.
2. Choose **Sindhi Colony** from the area filter.
3. Click a map marker or a vendor card. Explain the four sanitation factors.
4. Explain the weighted formula: water 40%, covered food 25%, gloves/headgear 20%, surroundings 15%.
5. Submit a structured review. Use ratings that reflect a genuine observation during the demo; the vendor score updates after the review is saved.
6. Open the concern report and show how users can report a specific observed issue.
7. Show the trail cards and explain that route details are sample data.
8. Close with the trust limitations: demo vendors are synthetic, FSSAI is not verified, and reviews are observations rather than proof of food safety.

## Judge questions
**Why is water weighted most?** Water can directly affect food and drink safety, so it receives the largest weight in the brief's scoring model.

**Can a vendor pay to improve the score?** Not in this prototype. The score is calculated from the four submitted structured factors.

**Are FSSAI badges real?** No. The prototype intentionally labels them unverified. Real verification needs a trusted official source and a documented validation process.

**How do you limit fake reviews?** The starter version validates the score ranges and records structured factors. A production version should add account verification, rate limits, duplicate detection, moderation, evidence review, appeals, and audit trails.

**What is next?** Secure image upload, vendor verification, live status, offline trail downloads, moderation dashboard, and a database such as SQLite/PostgreSQL.
