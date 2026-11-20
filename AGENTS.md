# AGENTS.md

## Cursor Cloud specific instructions

This is a static personal blog built with Astro 7 (Svelte + MDX + Tailwind v4). It is the only service in the repo.

- Dependencies install via `npm ci` (this is the startup update script). Node 22 is used.
- Standard commands live in `package.json` scripts:
  - Dev server: `npm run dev` (defaults to a random port; use `npm run dev -- --port 4321` to match `.vscode/launch.json`). Add `--host` to expose it.
  - Lint/type check + build: `npm run build` (runs `astro check` then `astro build`).
  - Preview built output: `npm run preview`.
- Gotchas:
  - `flake.nix` is pinned to `aarch64-darwin` and is not usable on the Linux cloud VM; ignore it and use `npm` directly.
  - The dev server logs many `[Shiki] The language "..." doesn't exist, falling back to "plaintext"` warnings from code fences in blog posts. These are harmless and expected, not errors.
  - CI (`.github/workflows/ci.yaml`) additionally runs Lighthouse (`lhci autorun`) after `npm run build`; that is a CI-only performance check, not needed for local dev.
