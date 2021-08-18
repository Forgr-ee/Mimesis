module.exports = {
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        'xs': '361px',
        'xsheight': { 'raw': '(min-height: 668px)' },
      },
      colors: {
        primary: "#B5244F",
        secondary: "#E67f3C",
        light: "#F0D7F5",
      },
      zIndex: {
        '60': '60',
      }
    },
  },
  // daisyui: {
  //   themes: [
  //     {
  //       'mimesis': {                          /* your theme name */
  //          'primary' : '#B5244F',           /* Primary color */
  //          'primary-focus' : '#7E1937',     /* Primary color - focused */
  //          'primary-content' : '#ffffff',   /* Foreground content color to use on primary color */

  //          'secondary' : '#E67f3C',         /* Secondary color */
  //          'secondary-focus' : '#A1582A',   /* Secondary color - focused */
  //          'secondary-content' : '#ffffff', /* Foreground content color to use on secondary color */

  //          'accent' : '#37cdbe',            /* Accent color */
  //          'accent-focus' : '#2aa79b',      /* Accent color - focused */
  //          'accent-content' : '#ffffff',    /* Foreground content color to use on accent color */

  //          'neutral' : '#3d4451',           /* Neutral color */
  //          'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
  //          'neutral-content' : '#ffffff',   /* Foreground content color to use on neutral color */

  //          'base-100' : '#ffffff',          /* Base color of page, used for blank backgrounds */
  //          'base-200' : '#f9fafb',          /* Base color, a little darker */
  //          'base-300' : '#d1d5db',          /* Base color, even more darker */
  //          'base-content' : '#1f2937',      /* Foreground content color to use on base color */

  //          'info' : '#2094f3',              /* Info */
  //          'success' : '#009485',           /* Success */
  //          'warning' : '#ff9900',           /* Warning */
  //          'error' : '#ff5724',             /* Error */
  //       },
  //     },
  //   ],
  // },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwind-capitalize-first-letter'),
    // require('daisyui'),
  ],
}
