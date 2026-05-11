/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1f2c", // Deep Navy
          light: "#2d3446",
          dark: "#0f121a",
        },
        accent: {
          DEFAULT: "#c5a059", // Luxury Gold
          light: "#d4b882",
          dark: "#a68241",
        },
        background: {
          light: "#f8f9fa",
          dark: "#121212",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e1e1e",
        }
      },
      fontFamily: {
        regular: ["Outfit-Regular"],
        medium: ["Outfit-Medium"],
        semibold: ["Outfit-SemiBold"],
        bold: ["Outfit-Bold"],
      },
    },
  },
  plugins: [],
};
