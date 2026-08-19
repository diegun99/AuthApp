# AGENTS.md

Angular 22 standalone SPA with SSR (Express) — the frontend for an external auth backend. Package manager: npm (`npm@11.16.0`).

## Commands

- `npm start` — dev server on `http://localhost:4200`
- `ng test` — unit tests via Vitest (`@angular/build:unit-test`), NOT Karma. Run one file: `ng test --include src/app/components/login/login.component.ts`; filter by suite/test name: `ng test --filter <regex>`; single run: `ng test --watch=false`
- `ng build` — production build (default config); SSR output lands in `dist/AuthApp`
- `npm run serve:ssr:AuthApp` — serve the built SSR app on port 4000 (build first)
- No lint is configured (no ESLint). Formatting is Prettier only: `npx prettier --write src` (config: printWidth 100, singleQuote, `angular` parser for HTML)

## Auth flow

- Backend URL is hardcoded in `src/app/services/auth.service.ts:27` (`http://localhost:5000/api/auth`); that server must be running for login/Google to work.
- Google login: `loginWithGoogle()` redirects the browser to `${apiUrl}/google-login`; the backend redirects back to `/auth/callback?token=<jwt>`, where `AuthCallbackComponent` saves the token and calls `/me`.
- Token is stored in `localStorage` keys `token` / `expires_at`; `src/app/interceptors/auth.interceptor.ts` adds `Authorization: Bearer <token>` to every HTTP call; `src/app/guards/auth.guard.ts` checks expiry by decoding the JWT with `atob`.
- Routes: `/login`, `/auth/callback`, `/dashboard` (guarded), `/` redirects to `/login`. All routes lazy-load via `loadComponent`.

## Gotchas

- SSR is enabled (`outputMode: server`, Express in `src/server.ts`) and `src/app/app.routes.server.ts` prerenders every route. `AuthService` touches `localStorage` in its constructor and `loginWithGoogle()` uses `window` — browser-only code can run during SSR/prerender; guard accordingly.
- The app is fully standalone (no NgModules). Components use inline templates/styles; the schematic default for new components is SCSS (`angular.json`).
- Static assets are served from `public/` (build `assets` input), not `src/assets/`. `login.component.ts` references `assets/google-icon.svg`, which does not exist yet — only `public/favicon.ico` is present.
- Specs use Vitest globals (`describe`/`it`/`expect`) without imports; `tsconfig.spec.json` sets `types: ["vitest/globals"]`.
