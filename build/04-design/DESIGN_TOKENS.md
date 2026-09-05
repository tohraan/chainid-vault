# Design Tokens

<!-- DEVIATION 2026-09-05: superseded on the human's instruction. The UI now uses
     the Krypsm platform's design tokens (~/krypsm/docs/theme.md), taking the
     values that file records as actually painting (its styles/tokens.css layer,
     which wins the cascade) rather than the superseded ones. The palette below
     is kept for provenance; frontend/tailwind.config.js is the live source.
     One deliberate departure from Krypsm: its docs flag white-on-#FCBD31 at
     1.68:1, below WCAG AA, so text on the yellow accent uses #1C1B1A (12.5:1)
     instead of white. -->

Tailwind config extension (`frontend/tailwind.config.js`) — copy directly, don't re-derive:

```js
// tailwind.config.js theme.extend.colors
colors: {
  brand: { DEFAULT: '#312E81', light: '#4338CA' },
  success: { DEFAULT: '#166534', bg: '#DCFCE7' },
  danger:  { DEFAULT: '#991B1B', bg: '#FEE2E2' },
  role: {
    admin:   '#312E81',
    manager: '#1D4ED8',
    auditor: '#B45309',
    user:    '#334155',
  },
}
```

## Spacing

Use Tailwind defaults (4px base scale) throughout — no custom spacing scale needed. Card padding: `p-6`. Section gaps: `gap-4` or `gap-6`, pick one and stay consistent per `04-design/UI_UX_GUIDELINES.md`.

## Radii

`rounded-lg` (8px) for cards/buttons, `rounded-full` for role badges/pills. Consistent across all 3 screens.

## Shadows

`shadow-sm` for cards, `shadow-md` for the toast/notification, `shadow-lg` for the revert-display banner (it should visually "pop" more than anything else on screen).
