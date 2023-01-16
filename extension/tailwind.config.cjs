/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "public/index.html",
    "src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background) / <alpha-value>)',
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        timer: {
          text: 'hsl(var(--color-timer-text) / <alpha-value>)',
          'prog-fill': 'hsl(var(--color-timer-prog-fill) / <alpha-value>)',
          'prog-track': 'hsl(var(--color-timer-prog-track) / <alpha-value>)',
          'fluid-fill': 'hsl(var(--color-timer-fluid-fill) / <alpha-value>)',
        },
        button: {
          fill: 'hsl(var(--color-button-fill) / <alpha-value>)',
          text: 'hsl(var(--color-button-text) / <alpha-value>)',
        },
        text: {
          base: 'hsl(var(--color-text-base) / <alpha-value>)',
          subtitle: 'hsl(var(--color-text-subtitle) / <alpha-value>)',
        },
      },
      opacity: {
        'timer-prog-track': 'var(--opacity-timer-prog-track)',
        'timer-fluid': 'var(--opacity-timer-fluid)',
      },
    },
  },
  plugins: [],
}
