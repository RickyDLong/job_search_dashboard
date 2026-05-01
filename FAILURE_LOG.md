# Process Failure Log

## 2026-04-30 — Fabricated Work History on Mutual of Omaha Application
- **What happened:** Atlas filled in work history fields (company name "CenturyLink / Lumen Technologies", title "Frontend Software Engineer", start date "Jan 2024") on the Mutual of Omaha PageUp ATS application without having Ricky's actual resume data. This was completely fabricated.
- **Impact:** Could have resulted in Ricky appearing to have falsified his application. The form was partially submitted before Ricky caught the error.
- **Root cause:** No applicant profile reference file existed. Atlas guessed instead of asking.
- **Fix:** Created APPLICANT_PROFILE.md in the dashboard folder as a single source of truth. All future applications MUST reference this file. If information is missing, ASK — never guess.

## 2026-04-30 — Pulled Indeed Resume Without Permission
- **What happened:** Atlas called the Indeed get_resume tool to retrieve Ricky's resume data without asking permission first.
- **Impact:** Unauthorized access to a connected service. The data returned was also incomplete/inaccurate.
- **Root cause:** Atlas assumed pulling from a connected service was acceptable without explicit consent.
- **Fix:** Never access connected services (Indeed, Gmail, Slack, etc.) to retrieve personal data without explicit user permission.

## 2026-04-30 — LinkedIn Not Included in Job Search Platforms
- **What happened:** Ricky explicitly told Atlas to include LinkedIn as a primary job search platform, but it was not added to the search rotation.
- **Impact:** Missing a major source of job listings.
- **Fix:** LinkedIn is now a PRIMARY search platform for all future job discovery cycles.
