module.exports = {
  content: ["content/**/*.md", "templates/**/*.html"],
  theme: {
    extend: {
      colors: {
        tomato: {
          300: "tomato",
          600: "#e62200",
        },
        shark: {
          950: "#282c34",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
