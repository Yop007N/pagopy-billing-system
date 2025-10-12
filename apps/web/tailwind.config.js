const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Paraguay Primary Blue (Based on flag #0033A0)
        primary: {
          50: '#e6ecf5',
          100: '#c0d0e6',
          200: '#96b0d5',
          300: '#6c90c4',
          400: '#4d78b8',
          500: '#2e60ab',
          600: '#0045a4',  // Close to Paraguay flag blue
          700: '#003a96',
          800: '#003088',
          900: '#001e6d',
          DEFAULT: '#0045a4',
        },
        // Paraguay Gold/Yellow (Based on flag #FFCD00)
        accent: {
          50: '#fffbee',
          100: '#fff5d4',
          200: '#ffefb8',
          300: '#ffe89b',
          400: '#ffe385',
          500: '#ffde70',
          600: '#ffc107',  // Rich gold
          700: '#f9a825',
          800: '#f57f17',
          900: '#ff6f00',
          DEFAULT: '#ffc107',
        },
        // Success (Green) - Financial positive actions
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          DEFAULT: '#43a047',
        },
        // Warning (Amber) - Alerts and cautions
        warning: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
          DEFAULT: '#ffa000',
        },
        // Error (Red) - Validation and errors
        error: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
          DEFAULT: '#e53935',
        },
        // Info (Teal) - Informational messages
        info: {
          50: '#e0f2f1',
          100: '#b2dfdb',
          200: '#80cbc4',
          300: '#4db6ac',
          400: '#26a69a',
          500: '#009688',
          600: '#00897b',
          700: '#00796b',
          800: '#00695c',
          900: '#004d40',
          DEFAULT: '#00897b',
        },
        // Neutral grays for text and backgrounds
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      // Custom shadow system
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 51, 160, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 51, 160, 0.1), 0 1px 2px 0 rgba(0, 51, 160, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 51, 160, 0.1), 0 2px 4px -1px rgba(0, 51, 160, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 51, 160, 0.1), 0 4px 6px -2px rgba(0, 51, 160, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 51, 160, 0.1), 0 10px 10px -5px rgba(0, 51, 160, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 51, 160, 0.25)',
      },
    },
  },
  plugins: [],
};
