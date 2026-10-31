# ShaheenLMS design notes

Read before changing the UI. All visual polish lives in `public/assets/css/shaheenlms-ui.css`,
loaded last (after Limitless and `shaheenlms-theme.css`). Print/PDF views use their own CSS and
are deliberately untouched.

- **Mode and ground:** light only, grey page (`--page #F5F5F5`) with white cards.
- **Colour:** brand greens are the project's own: `#16A34A` (accent, marks), `#166534` (navbar,
  hover), `#DCFCE7` (tint). White text never sits on `#16A34A` (3.3:1); filled buttons, the
  active nav row, pagination and calendar events use `--brand-strong #15803D` (5.0:1).
  Neutrals and state colours generated with
  `node oxfords/scripts/palette.mjs --brand "#16A34A" --mode light --ground grey`.
- **Red is for destruction and errors only** (`--danger #C31B1F`). Submit/Pay/Print use primary.
- **Type:** system font stack, one family. Scale 24 / 20 / 16 / 14 (body) / 13 / 12.
  Tabular figures in tables and stats.
- **Radius:** 6px controls, 8px alerts/dropdowns, 12px cards/modals.
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32 (`--space-*`).
- **Icons:** the template's IcoMoon set, unchanged.
- **Deliberate exceptions:**
  - Navbar and sidebar stay brand green (the brand owns them), rather than neutral chrome.
  - The dashboard stats row (`.slms-stats`) keeps four figure tiles because they are the only
    figures the dashboard has; they are neutral cards, not four colours.
  - JS-selected classes are never renamed; new classes are additive only.
