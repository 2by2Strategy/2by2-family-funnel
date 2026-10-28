# 2by2 Academy – website and matchmaking funnel

- `index.html` – main 2by2 Academy site (all booking buttons go to `matchmaking/`)
- `matchmaking/index.html` – funnel landing page (hero, trust bar, → Get started)
- `matchmaking/quiz.html` – the 10-question matchmaking questionnaire
- `counselors/index.html` – counselor (B2B) landing page, same look as the family funnel (→ Get started)
- `counselors/quiz.html` – the 10-question counselor questionnaire (answers go to the sheet's "Counselor Quiz" tab)
- `counselors/booked.html` – page counselors land on after booking the partner call: the VSL (`counselors/vsl/`) on top, then the counselor landing page. Set it as the redirect URL on the GHL "2by2 Partner Call" calendar. Sends Meta `Schedule` once per browser, plus VSL play/progress events.
- `quiz.html` – redirect to `matchmaking/quiz.html` (keeps old links working)

## Before running ads
Edit the SETTINGS block at the top of the `<script>` in each file:
- `matchmaking/quiz.html`: `BOOKING_URL` (2by2 calendar link), `WEBHOOK_URL` (GoHighLevel inbound webhook)
- `counselors/quiz.html`: `BOOKING_URL` (counselor fit-call calendar), `WEBHOOK_URL` (a separate GHL webhook for counselors)
  - Who gets screened out ("might not be the right fit yet" + email list) is set in `notAFit()` in the same script
- `matchmaking/index.html`: `PROOF` (rating, families matched, family photos)

Hosted with GitHub Pages from the `main` branch.
