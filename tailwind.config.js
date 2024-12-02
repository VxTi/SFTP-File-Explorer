/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,tsx,ts}',
    ],
    theme: {
        extend: {
            colors: {
                'special': 'var(--color-special)',
                'primary': 'var(--color-primary)',
                'secondary': 'var(--color-secondary)',
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
            },
            textColor: {
                'primary': 'var(--color-text-primary)',
                'primary-hover': 'var(--color-text-primary-hover)',
                'secondary': 'var(--color-text-secondary)',
                'secondary-hover': 'var(--color-text-secondary-hover)',
                'special': 'var(--color-text-special)',
                'bg-primary': 'var(--color-primary)',
            },
            backgroundColor: {
              "border": "var(--color-border)",
                'background': 'var(--color-background)',
                'primary': 'var(--color-primary)',
                'special': 'var(--color-special)',
                'hover': 'var(--color-primary-hover)',
                'secondary': 'var(--color-secondary)',
                'tertiary': 'var(--color-tertiary)'
            },
            borderColor: {
                'primary': 'var(--color-border)',
            },
            stroke: {
                'primary': 'var(--color-text-primary)',
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}

