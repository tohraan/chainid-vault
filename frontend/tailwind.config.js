/** @type {import('tailwindcss').Config} */
// Token values are copied verbatim from build/04-design/DESIGN_TOKENS.md.
// Do not re-derive them — that file is the source of truth.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#312E81", light: "#4338CA" },
        success: { DEFAULT: "#166534", bg: "#DCFCE7" },
        danger: { DEFAULT: "#991B1B", bg: "#FEE2E2" },
        role: {
          admin: "#312E81",
          manager: "#1D4ED8",
          auditor: "#B45309",
          user: "#334155",
        },
      },
    },
  },
  plugins: [],
};
