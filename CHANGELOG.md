# Changelog

## [2.0.0]

- Upgraded `maplibre-gl` from 5.x to 6.x (`^6.8.0`) to fix CVE-2026-85061 / GHSA-jrc7-96c5-q579, a critical XSS sanitizer bypass in MapLibre's `DOM.sanitize()`
- Breaking: MapLibre GL JS 6 requires WebGL2 (WebGL1 support was removed) and is published as ESM only, targeting ES2022
- Breaking: `Map` props extend react-map-gl's MapLibre props, so their TypeScript types now come from MapLibre 6; apps that also depend on `maplibre-gl` directly should upgrade to 6.x
- Updated development and build dependencies (`vitest`, `@vitest/coverage-v8`, `storybook`, `vite`, and transitive tooling packages), including fixes for Dependabot security alerts

## [1.6.0]

- Add `centerBounds` prop to constrain addresses within a supported region

## [1.5.0]

- Replace draggable marker with center-fixed map panning UX
- Add tooltip to disabled locate button and warning notification for no results
- Support optional client prop and transformRequest for map authentication

## [1.4.1]

- Fixed 9 security vulnerabilities in dependencies
- Updated `fast-xml-parser` dependency
- Fixed default map zoom to prevent 3D globe view

## [1.4.0]

- Country code filtering now accepts both alpha-2 and alpha-3 formats (e.g., "US" or "USA")
- Updated `@smithy/config-resolver` dependency
- Updated `lodash` dependency
