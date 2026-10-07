/** @type {import('tailwindcss').Config} */
// 设计令牌来源：冻结原型 prototype/assets/tokens.css（UI 契约 v1.1，勿改值，改值走变更确认）
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        jys: {
          primary: 'var(--jys-primary)',
          'primary-hover': 'var(--jys-primary-hover)',
          'primary-light': 'var(--jys-primary-light)',
          page: 'var(--jys-bg-page)',
          card: 'var(--jys-bg-card)',
          'text-1': 'var(--jys-text-1)',
          'text-2': 'var(--jys-text-2)',
          'text-3': 'var(--jys-text-3)',
          border: 'var(--jys-border)',
        },
      },
      boxShadow: {
        jys: 'var(--jys-shadow-sm)',
        'jys-md': 'var(--jys-shadow-md)',
      },
    },
  },
  plugins: [],
};
