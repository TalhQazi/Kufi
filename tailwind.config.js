/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#C69C6D',
                    dark: '#9B6F40',
                    brown: '#b7791f',
                    light: '#f59e0b',
                },
                gold: {
                    DEFAULT: '#f59e0b',
                    dark: '#b7791f',
                    light: '#facc15',
                },
                beige: {
                    light: '#fdfaf5',
                    DEFAULT: '#f7f3ec',
                    dark: '#F5EFE6',
                },
                slate: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#0f172a',
                }
            },
            fontFamily: {
                sacramento: ['Sacramento', 'cursive'],
                playfair: ['Playfair Display', 'serif'],
                inter: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'hero': "linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('/src/assets/hero.jpeg')",
            },
            boxShadow: {
                'card': '0 18px 40px rgba(15, 23, 42, 0.18)',
                'card-hover': '0 18px 40px rgba(15, 23, 42, 0.28)',
                'header': '0 8px 20px rgba(15, 23, 42, 0.08)',
            },
        },
    },
    plugins: [],
}
