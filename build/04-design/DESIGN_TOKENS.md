# Design Tokens

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
