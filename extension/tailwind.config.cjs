/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "public/index.html",
    "src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        primary: 'var(--color-primary)',
        timer: {
          text: 'var(--color-timer-text)',
          'prog-fill': 'var(--color-timer-prog-fill)',
          'prog-track': 'var(--color-timer-prog-track)',
          'fluid-fill': 'var(--color-timer-fluid-fill)',
        },
        button: {
          fill: 'var(--color-button-fill)',
          text: 'var(--color-button-text)',
        },
        text: {
          base: 'var(--color-text-base)',
          subtitle: 'var(--color-text-subtitle)',
        },
      },
      opacity: {
        timer: {
          'prog-track': 'var(--opacity-timer-prog-track)',
          'fluid': 'var(--opacity-timer-fluid)',
        },
      },
    },
  },
  plugins: [],
}
