# Design System

## Philosophy for this build

Clean, legible, demo-friendly over "polished product." Judges are watching a projector from a distance — big text, high contrast, obvious state changes (pending/success/error) matter more than visual sophistication. See `01-product/NON_FUNCTIONAL_REQUIREMENTS.md` NFR-3.

## Palette

Pick ONE palette, apply consistently across all 3 screens (Tailwind config, define as custom colors, don't use raw Tailwind blue-500 etc. everywhere so it reads intentional):

- Primary (brand/action): deep indigo `#312E81` (Tailwind `indigo-900`) — buttons, active nav
- Success: `#166534` (`green-800`) background tint `#DCFCE7` (`green-100`) — confirmed tx toast
- Error/Revert: `#991B1B` (`red-800`) background tint `#FEE2E2` (`red-100`) — the rejection display, must be visually LOUD, this is a demo-critical element
- Neutral background: white `#FFFFFF`, card surface `#F9FAFB` (`gray-50`)
- Text: `#111827` (`gray-900`) primary, `#6B7280` (`gray-500`) secondary/captions

## Typography

System font stack (Tailwind default, `font-sans`) — no custom font loading, one less thing to break on a demo machine. Headings bold, 24-32px. Body 14-16px. Revert-reason text: 18-20px, bold, high contrast — must be readable from the back of a room.

## Components (see `COMPONENT_ARCHITECTURE.md` for code-level breakdown)

Buttons (primary/secondary/danger), form inputs (address + text), toast notification, revert-display banner, data table (for audit trail + asset lists), role badge (small colored pill showing Admin/Manager/Auditor/User).

## Motif

One consistent visual anchor: role badges as colored pills (Admin=indigo, Manager=blue, Auditor=amber, User=slate) reused everywhere a role appears (account switcher, audit trail rows, identity list) — gives visual consistency without needing icons or illustration work under time pressure.
