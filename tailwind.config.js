/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#13C8EC", // Cyan Blue
          soft: "rgba(19, 200, 236, 0.1)",
          glow: "rgba(19, 200, 236, 0.3)",
        },
        dark: {
          DEFAULT: "#101F22", // Background
          surface: "rgba(28, 37, 39, 0.7)",
          card: "#1C2527",
          border: "rgba(255, 255, 255, 0.05)",
        },
        light: {
          DEFAULT: "#F6F8F8",
          card: "#FFFFFF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#64748B",
        slate: {
          100: "#F1F5F9",
          400: "#94A3B8",
          500: "#64748B",
        }
      },
      fontFamily: {
        sans: ["Poppins_400Regular"],
        medium: ["Poppins_500Medium"],
        semibold: ["Poppins_600SemiBold"],
        bold: ["Poppins_700Bold"],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      }
    },
  },
  plugins: [],
}
