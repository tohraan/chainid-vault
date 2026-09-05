/** @type {import('tailwindcss').Config} */
//
// Design tokens adopted from the Krypsm platform (~/krypsm/docs/theme.md).
// Values are the ones Krypsm's docs record as ACTUALLY PAINTING — the
// styles/tokens.css layer, which wins the cascade over index.css — not the
// superseded declarations. That file's own rule is "the build is the source of
// truth", so these are the live values, not the aspirational ones.
//
// Only this token layer changed. Every component keeps its existing class
// names, so the whole UI re-themes without touching a single component file.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Krypsm's sidebar is solid black with a yellow accent. `brand` is the
        // structural/authority colour (header, primary buttons) and keeps white
        // text at ~15:1. `accent` is the yellow, used for emphasis.
        brand: {
          DEFAULT: "#1C1B1A", // --color-text-primary, warm near-black
          light: "#33312F",
          ink: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FCBD31", // --color-accent-primary
          hover: "#E3A92B", // --color-accent-hover
          reward: "#C98A2E", // --color-accent-reward
          // Krypsm's own docs flag white-on-yellow at 1.68:1, below WCAG AA.
          // Black on the same yellow is 12.5:1, so text on accent uses this.
          ink: "#1C1B1A",
        },

        success: {
          DEFAULT: "#2E9E5B", // --color-status-active
          bg: "#E7F4EC", // tint of the same hue
        },
        warning: {
          DEFAULT: "#D89A2E", // --color-status-idle
          bg: "#FDF3E0",
        },
        danger: {
          // --destructive #EF4444 reads well as a fill or border but is too
          // light for body text on a tint, so text uses the same hue darkened
          // (hsl 0 84% 40%). Derived from the token, not invented alongside it.
          DEFAULT: "#BC1C1C",
          fill: "#EF4444",
          bg: "#FDECEC",
        },

        // Role badges map onto Krypsm's category palette, which exists exactly
        // to keep sibling categories visually distinct.
        role: {
          admin: "#1C1B1A", // authority — text-primary
          manager: "#3B8FD9", // category-productivity
          auditor: "#C98A2E", // accent-reward
          user: "#A3A099", // category-uncategorized
        },

        // Krypsm's neutrals are warm (#FAFAF9 / #1C1B1A / #E5E3DF), not
        // Tailwind's cool grey ramp. Overriding `slate` re-themes every
        // existing slate-* class in the app at once.
        slate: {
          50: "#FAFAF9", // --color-bg-base
          100: "#F2F1EE", // --color-bg-muted
          200: "#E5E3DF", // --color-border
          300: "#D6D3CD",
          400: "#A3A099", // --color-status-offline
          500: "#6B6862", // --color-text-secondary
          600: "#5A5751",
          700: "#46433E",
          800: "#2E2C29",
          900: "#1C1B1A", // --color-text-primary
        },
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Krypsm's live ramp: 16 / 20 / 24 / 32
        xs: ["12px", "1.5"],
        sm: ["14px", "1.55"],
        base: ["16px", "1.6"],
        lg: ["20px", "1.4"],
        xl: ["24px", "1.3"],
        "2xl": ["32px", "1.2"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.06)", // --shadow-card
        md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        lg: "0 8px 24px rgba(0,0,0,0.12)", // --shadow-modal
      },
    },
  },
  plugins: [],
};
