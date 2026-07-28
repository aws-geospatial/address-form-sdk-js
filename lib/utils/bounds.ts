// A geographic bounding box as [[west, south], [east, north]] in [longitude, latitude]
// degrees — the same tuple form MapLibre accepts for `maxBounds`. Assumes a
// non-inverted box (west < east, south < north) and does not handle bounds that
// cross the antimeridian.
export type CenterBounds = [[number, number], [number, number]];

// Clamp a [lng, lat] point so it never leaves `bounds`. Idempotent — clamping an
// already-inside point returns it unchanged. When no bounds are given the point is
// returned as-is, so callers can pass an optional bounds without branching.
export const clampCenterToBounds = (center: [number, number], bounds?: CenterBounds): [number, number] => {
  if (!bounds) return center;
  const [[west, south], [east, north]] = bounds;
  const [lng, lat] = center;
  return [Math.min(Math.max(lng, west), east), Math.min(Math.max(lat, south), north)];
};

// Inclusive containment check. Points on an edge count as inside so that a point
// clamped onto a boundary by clampCenterToBounds reads as within — otherwise an
// out-of-region warning would never clear after recentering. Undefined bounds means
// "no restriction", so everything is within.
export const isCenterWithinBounds = (center: [number, number], bounds?: CenterBounds): boolean => {
  if (!bounds) return true;
  const [[west, south], [east, north]] = bounds;
  const [lng, lat] = center;
  return lng >= west && lng <= east && lat >= south && lat <= north;
};
