# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`, project references) then `vite build` to `dist/`
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- `npm run preview` — serve the production build

There is no test runner configured yet. `npm run build` is the type-check gate; there is no separate `typecheck` script (use `npx tsc -b` to type-check without bundling).

## Scope

Implement only what is asked. Don't add unrequested UI, behavior, or state (e.g. extra helper text, disabling buttons, persisting values across steps, clickable navigation) even if it seems like an improvement — suggest it in the reply instead and let the user decide.

## Stack

React 19 + TypeScript 7 + Vite 8, linted with oxlint (not ESLint). `src/main.tsx` imports `oa/style.css` and mounts `<App />` in `StrictMode`. `src/App.tsx` holds the two `oa` tabs (Enter a Charge, Import Spreadsheet), whose contents live in `src/tabs/`; the Import Spreadsheet steps (Upload, MatchColumns, Review) are in `src/tabs/importSteps/`.

- **Forms:** `react-hook-form` is the intended form-state library. Any `FormGroup` containing a required field gets the `required` class (oa's CSS adds a ` *` after its direct child `<label>`). If a field is only required conditionally, apply the class under the same condition.
- **UI components:** `oa` is an in-house component library installed from GitHub (`github:cstier-tech/oa#v0.2.0`), a thin wrapper around `react-bootstrap` (Bootstrap 5 + Font Awesome 7). It exports Accordion, Alert, AlertToast, Badge, Button, Card, Costep/Costeps (step indicator), Layout, Form (`Form`, `FormGroup`, `FormLabel`, `FormControl`, `FormSelect`, `FormCheck`, `InputGroup`, `Feedback`, …), Icon, Modal, Popover, Tables, Tabs, and Tooltip. Prop types match the underlying react-bootstrap props; see `node_modules/oa/dist/types/` for exact signatures. Its styles (Bootstrap + Font Awesome) ship separately as `oa/style.css`, which must be imported once (done in `main.tsx`). Prefer `oa` components over raw react-bootstrap or hand-rolled markup. Because `oa` is pinned by git tag, upgrading it means changing the tag in `package.json`.

## TypeScript constraints

`tsconfig.app.json` covers `src/`; `tsconfig.node.json` covers `vite.config.ts`. Settings that affect how code must be written:

- `verbatimModuleSyntax`: type-only imports must use `import type` / `import { type X }`.
- `erasableSyntaxOnly`: no `enum`, `namespace`, or constructor parameter properties. Use union types or `as const` objects instead.
- `allowImportingTsExtensions`: local imports include the extension (`./App.tsx`).
- `noUnusedLocals` / `noUnusedParameters`: unused code fails the build.
- oxlint's `react/only-export-components` warns when a component file also exports non-components (breaks Fast Refresh).
