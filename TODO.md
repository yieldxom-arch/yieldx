# TODO — Light Mode fix for 3D Project Presentation cards

- [x] Inspect how the app theme is stored (isDark/theme/dark class) and how other components react.
- [x] Implement theme-responsive wiring in `src/app/components/visualization/ProjectVisualization3D.tsx` (read `theme` from `useYieldX()` and derive `isDark`).
- [ ] Update cards/panels/buttons/badges to fully switch between Dark and Light mode (no hardcoded dark-only styling).

- [ ] Update light-mode glow -> subtle light shadow.
- [ ] Ensure every child element updates instantly on theme toggle.
- [ ] Run typecheck/build and verify visually.

