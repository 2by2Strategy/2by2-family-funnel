# 2by2 Academy – website and matchmaking funnel

- `index.html` – main 2by2 Academy site (all booking buttons go to `matchmaking/`)
- `matchmaking/index.html` – funnel landing page (hero, trust bar, → Get started)
- `matchmaking/quiz.html` – the 10-question matchmaking questionnaire
- `counselors/index.html` – counselor (B2B) landing page, same look as the family funnel (→ Get started)
- `counselors/quiz.html` – the counselor questionnaire (answers go to the sheet's "Counselor Quiz" tab). Order: role → name → email/phone → screening questions. Meta `SubmitApplication` (the B2B ad set's conversion event) fires once on the first answered question; `CounselorLead` fires when they finish every question
- `counselors/booked.html` – page counselors land on after booking the partner call: the VSL (`counselors/vsl/`) on top, then the counselor landing page. Set it as the redirect URL on the GHL "2by2 Partner Call" calendar. Sends Meta `Schedule` once per browser, plus VSL play/progress events.
- `start/index.html` – phone landing page for Instagram/ManyChat: the free Roadmap (links to `roadmap/`) and the matchmaking call, plus student review screenshots in `start/reviews/`
- `roadmap/index.html` – Roadmap preview + free download form (grade, first name, role, email). Saves to the sign-ups sheet (`source` = roadmap-free), posts to the GHL webhook in `GHL_WEBHOOK` if set, fires Meta `Lead`, then opens the download page
- `roadmap-xdsrojwg9uzkn2fp/` – free Roadmap download page (holds the PDF). The Roadmap is free since Nov 12, 2026 (physical copy sold out); the old $19.99 Stripe checkout is retired.
- `quiz.html` – redirect to `matchmaking/quiz.html` (keeps old links working)

## Before running ads
Edit the SETTINGS block at the top of the `<script>` in each file:
- `matchmaking/quiz.html`: `BOOKING_URL` (2by2 calendar link), `WEBHOOK_URL` (GoHighLevel inbound webhook)
- `counselors/quiz.html`: `BOOKING_URL` (counselor fit-call calendar), `WEBHOOK_URL` (a separate GHL webhook for counselors)
  - Who gets screened out ("might not be the right fit yet" + email list) is set in `notAFit()` in the same script
- `matchmaking/index.html`: `PROOF` (rating, families matched, family photos)

Hosted with GitHub Pages from the `main` branch.
