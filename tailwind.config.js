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
                    DEFAULT: '#34455E',
                    light:   '#5C7290',
                    pale:    '#EEF2F6',
                    dark:    '#1F2A3A',
                },
                ink: {
                    DEFAULT: '#1B2431',
                    2:       '#29344A',
                },
                cream: {
                    DEFAULT: '#F8F6F1',
                    2:       '#F0EDE6',
                    3:       '#E8E3D8',
                },
                muted: '#6B7686',
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
