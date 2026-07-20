/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    DEFAULT: '#C09A3A',
                    light:   '#D4AF5A',
                    pale:    '#FEF8E8',
                    dark:    '#8B6914',
                },
                ink: {
                    DEFAULT: '#1a1814',
                    2:       '#2e2b25',
                },
                cream: {
                    DEFAULT: '#F8F6F1',
                    2:       '#F0EDE6',
                    3:       '#E8E3D8',
                },
                muted: '#8a7a6a',
            },
            fontFamily: {
                cairo: ['Cairo', 'sans-serif'],
                playfair: ['"Playfair Display"', 'serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
