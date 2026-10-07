import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.vue.d.ts', 'prototype/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // .vue 文件：vue-eslint-parser 解析 SFC，script 块委托 typescript-eslint（覆盖 tseslint 全局 parser）
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
    plugins: { vue: pluginVue },
    rules: { ...pluginVue.configs['flat/recommended'].rules },
  },
  { rules: { '@typescript-eslint/no-explicit-any': 'warn' } },
);
