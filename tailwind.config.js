module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        // =========================
        // BRAND PRIMARY
        // =========================
        primary: {
          50:  '#F2F6F7',
          100: '#DCE6E9',
          200: '#B8CDD3',
          300: '#94B4BD',
          400: '#6F9BA7',
          500: '#4A6E7A',
          600: '#3F5F69',
          700: '#344F58',
          800: '#293F46',
          900: '#1F3035',
        },

        // =========================
        // ERROR / DESTRUCTIVE (Brand Red)
        // =========================
        error: {
          50:  '#FDECEC',
          100: '#F9D5D3',
          200: '#F3ABA7',
          300: '#EC817B',
          400: '#E6574F',
          500: '#AE2D24',
          600: '#93261E',
          700: '#771F18',
          800: '#5C1812',
          900: '#40110D',
        },

        // =========================
        // SEMANTIC COLORS
        // =========================
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          500: '#22C55E',
          600: '#16A34A',
        },

        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },

        info: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
        },

        // =========================
        // NEUTRAL SYSTEM (TEXT + UI)
        // =========================
        neutral: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // =========================
        // SURFACE TOKENS (UX LAYER)
        // =========================
        surface: '#FFFFFF',
        background: '#F9FAFB',
        border: '#E5E7EB',
      },

      // =========================
      // TYPOGRAPHY
      // =========================
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '26px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
      },

      // =========================
      // SPACING SYSTEM
      // =========================
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
      },

      // =========================
      // BORDER RADIUS
      // =========================
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },

      // =========================
      // SHADOW SYSTEM
      // =========================
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        dropdown: '0 4px 12px rgba(0,0,0,0.1)',
        modal: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },

  plugins: [],
}
