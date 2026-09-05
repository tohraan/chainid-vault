# Responsive Design — Minimal This Scope

## Decision

Not a priority. This demo runs on a single laptop connected to a projector or shared screen — desktop viewport only. Do not spend time on mobile breakpoints, touch interactions, or tablet layouts.

## Minimum bar

Layout should not visually break (overlapping elements, cut-off text) at common laptop resolutions (1366×768 up to 1920×1080). Tailwind's default responsive utilities are fine to use opportunistically (e.g. `md:grid-cols-3`) if it costs zero extra time, but do not build a dedicated mobile layout or test on phone viewports.

## Future phases

Real responsive/mobile support belongs in a post-hackathon phase per `02-planning/DEVELOPMENT_ROADMAP.md`, once there's an actual mobile use case (e.g. QR-scan asset verification mentioned as a stretch idea in earlier team discussion) — not invented now.
