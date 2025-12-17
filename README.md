# Vue 3 + TypeScript + ESLint Project

A modern Vue 3 project setup with TypeScript and the latest ESLint flat configuration.

## Features

- ⚡️ **Vue 3** - Latest version with Composition API
- 🔷 **TypeScript** - Full type safety
- 📏 **ESLint 9** - Latest flat config format
- 🚀 **Vite** - Fast development and building
- 🎨 **Modern CSS** - With dark mode support

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Lint your code:**
   ```bash
   npm run lint        # Fix issues automatically
   npm run lint:check  # Check without fixing
   ```

5. **Type checking:**
   ```bash
   npm run type-check
   ```

## ESLint Configuration

This project uses ESLint 9's new flat configuration format (`eslint.config.js`) which provides:

- Better performance
- More intuitive configuration
- Better IDE support
- Cleaner rule management

**Important:** If you're migrating from an older project, make sure to:
1. Remove any `.eslintrc.*` files
2. Use the new `eslint.config.js` format
3. Update your package.json dependencies

## TypeScript Features

- Strict type checking enabled
- Path aliases (`@/` for `src/`)
- Vue 3 Composition API with proper typing
- Type-based prop and emit declarations