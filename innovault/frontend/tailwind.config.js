/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 900
                foreground: "#f8fafc", // Slate 50
                primary: "#3b82f6", // Blue 500
                secondary: "#8b5cf6", // Violet 500
                accent: "#06b6d4", // Cyan 500
                card: "#1e293b", // Slate 800
                input: "#334155", // Slate 700
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
