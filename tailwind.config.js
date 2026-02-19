/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#42224A",
          soft: "#8F659A",
        },
        accent: "#EF8767",
        background: "#F7F4F7",
        dark: "#120216",
        card: "#FFFFFF",
      },
      fontFamily: {
        poppins: ["Poppins_400Regular"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
        "poppins-light": ["Poppins_300Light"],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
