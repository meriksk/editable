# Project: @meriksk/editable

jQuery inline plain-text editing plugin.

## Stack
- Vanilla JS (ES modules)
- jQuery (peer dependency, >=1.9)
- Rollup (bundler: ESM, CJS, UMD outputs)
- Vitest + jsdom (testing)

## Key Decisions
- Plugin distributed as a factory function: `import editable from '@meriksk/editable'; editable($);`
- jQuery is external — never bundled, always peer dep
- No TypeScript

## Commands
- `npm run build` — produce dist/ via Rollup
- `npm test` — run Vitest suite
- `npm run test:coverage` — coverage report
- `npm run dev` — Rollup watch mode

## File Limits
- No file > 300 lines
- All tests must pass before any commit
