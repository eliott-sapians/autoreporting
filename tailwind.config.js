/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors (using the CSS variables from globals.css)
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'dark': '#3A4642',
        'foreground-dark': '#FFFF69',
        'primary': {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        'secondary': {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        'muted': {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        'accent': {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        'destructive': {
          DEFAULT: 'var(--destructive)',
          // Assuming you'll add --destructive-foreground in globals.css if needed
        },
        'border': 'var(--border)',
        'input': 'var(--input)',
        'ring': 'var(--ring)',
        'card': {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        'popover': {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        // Sapians specific colors from globals.css
        'yellow-sapians-500': 'var(--color-yellow-sapians-500)',
        'green-forest-sapians-500': 'var(--color-green-forest-sapians-500)',
        'green-sapians-100': 'var(--color-green-sapians-100)',
        'green-sapians-300': 'var(--color-green-sapians-300)',
        'green-sapians-500': 'var(--color-green-sapians-500)',
        'grey-sapians-100': 'var(--color-grey-sapians-100)',
        'grey-sapians-200': 'var(--color-grey-sapians-200)',
        'grey-sapians-300': 'var(--color-grey-sapians-300)',
        'grey-sapians-500': 'var(--color-grey-sapians-500)',
        'grey-sapians-700': 'var(--color-grey-sapians-700)',
        'blue-atlante-sapians-100': 'var(--color-blue-atlante-sapians-100)',
        'blue-atlante-sapians-300': 'var(--color-blue-atlante-sapians-300)',
        'blue-atlante-sapians-500': 'var(--color-blue-atlante-sapians-500)',
        'blue-royal-sapians-100': 'var(--color-blue-royal-sapians-100)',
        'blue-royal-sapians-300': 'var(--color-blue-royal-sapians-300)',
        'blue-royal-sapians-500': 'var(--color-blue-royal-sapians-500)',
        'lavande-sapians-100': 'var(--color-lavande-sapians-100)',
        'lavande-sapians-300': 'var(--color-lavande-sapians-300)',
        'lavande-sapians-500': 'var(--color-lavande-sapians-500)',
        'orange-sapians-100': 'var(--color-orange-sapians-100)',
        'orange-sapians-300': 'var(--color-orange-sapians-300)',
        'orange-sapians-500': 'var(--color-orange-sapians-500)',
        // Chart colors
        'chart-1': 'var(--color-chart-1)',
        'chart-2': 'var(--color-chart-2)',
        'chart-3': 'var(--color-chart-3)',
        'chart-4': 'var(--color-chart-4)',
        'chart-5': 'var(--color-chart-5)',
        // Sidebar colors
        'sidebar': {
          DEFAULT: 'var(--color-sidebar)',
          foreground: 'var(--color-sidebar-foreground)',
          primary: {
            DEFAULT: 'var(--color-sidebar-primary)',
            foreground: 'var(--color-sidebar-primary-foreground)',
          },
          accent: {
            DEFAULT: 'var(--color-sidebar-accent)',
            foreground: 'var(--color-sidebar-accent-foreground)',
          },
          border: 'var(--color-sidebar-border)',
          ring: 'var(--color-sidebar-ring)',
        }
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      }
    },
  },
}; 