import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcss from '@tailwindcss/postcss';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
  // plugins: [
  //   tailwindcss,
  //   autoprefixer,
  //   postcss,
  // ],
  // {
  //   tailwindcss: {},
  //   autoprefixer: {},
  // }
} 