/** @type {import('tailwindcss').Config} */

export default {

  content: [

    "./index.html",

    "./src/**/*.{js,jsx,ts,tsx}",

  ],

  theme: {

    container: {

      center: true,

      padding: "1rem",

      screens: {

        sm: "420px",

        md: "768px",

        lg: "1024px",

      },

    },

    extend: {

      /**
       * =====================================================
       * COLORS
       * =====================================================
       */

      colors: {

        brand: {

          orange: "#F28C28",

          darkOrange: "#D97706",

          cream: "#FFF8F0",

          beige: "#F6E7D8",

          gold: "#F4C46C",

          dark: "#1F2937",

          gray: "#6B7280",

          success: "#10B981",

          danger: "#EF4444",

          warning: "#F59E0B",

          info: "#3B82F6",

        },

      },

      /**
       * =====================================================
       * FONT
       * =====================================================
       */

      fontFamily: {

        sans: [

          "Inter",

          "system-ui",

          "sans-serif",

        ],

      },

      /**
       * =====================================================
       * SHADOWS
       * =====================================================
       */

      boxShadow: {

        premium:
          "0 10px 40px rgba(242,140,40,0.25)",

        soft:
          "0 4px 20px rgba(0,0,0,0.06)",

        card:
          "0 2px 12px rgba(0,0,0,0.05)",

        glass:
          "0 8px 32px rgba(31,41,55,0.08)",

      },

      /**
       * =====================================================
       * RADIUS
       * =====================================================
       */

      borderRadius: {

        "4xl": "2rem",

        "5xl": "2.5rem",

      },

      /**
       * =====================================================
       * SAFE AREA
       * =====================================================
       */

      spacing: {

        safeTop:
          "env(safe-area-inset-top)",

        safeBottom:
          "env(safe-area-inset-bottom)",

      },

      /**
       * =====================================================
       * Z INDEX
       * =====================================================
       */

      zIndex: {

        header: "100",

        navigation: "110",

        overlay: "120",

        modal: "130",

        toast: "140",

      },

      /**
       * =====================================================
       * BACKDROP
       * =====================================================
       */

      backdropBlur: {

        xs: "2px",

      },

      /**
       * =====================================================
       * ANIMATION
       * =====================================================
       */

      animation: {

        float:
          "float 3s ease-in-out infinite",

        pulseSoft:
          "pulseSoft 2s infinite",

        slideUp:
          "slideUp 0.35s ease-out",

        fadeIn:
          "fadeIn 0.3s ease-out",

        shimmer:
          "shimmer 1.8s linear infinite",

      },

      /**
       * =====================================================
       * KEYFRAMES
       * =====================================================
       */

      keyframes: {

        float: {

          "0%, 100%": {

            transform:
              "translateY(0px)",

          },

          "50%": {

            transform:
              "translateY(-8px)",

          },

        },

        pulseSoft: {

          "0%, 100%": {

            opacity: 1,

          },

          "50%": {

            opacity: 0.6,

          },

        },

        slideUp: {

          from: {

            opacity: 0,

            transform:
              "translateY(16px)",

          },

          to: {

            opacity: 1,

            transform:
              "translateY(0)",

          },

        },

        fadeIn: {

          from: {

            opacity: 0,

          },

          to: {

            opacity: 1,

          },

        },

        shimmer: {

          "0%": {

            backgroundPosition:
              "-200% 0",

          },

          "100%": {

            backgroundPosition:
              "200% 0",

          },

        },

      },

      /**
       * =====================================================
       * TRANSITION
       * =====================================================
       */

      transitionTimingFunction: {

        premium:
          "cubic-bezier(0.4, 0, 0.2, 1)",

      },

      /**
       * =====================================================
       * GRADIENTS
       * =====================================================
       */

      backgroundImage: {

        brandGradient:
          "linear-gradient(135deg, #F28C28 0%, #D97706 100%)",

        creamGradient:
          "linear-gradient(180deg, #FFF8F0 0%, #F6E7D8 100%)",

      },

    },

  },

  plugins: [],

};